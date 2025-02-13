import { Injectable, NotFoundException } from '@nestjs/common';
import { PrestamoDto } from './dto/prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Prestamos } from 'src/entities/entities/Prestamos';
import { Repository } from 'typeorm';
import { PresAprobacionPrestamos } from 'src/entities/entities/PresAprobacionPrestamos';
import { PresCuotas } from 'src/entities/entities/PresCuotas';
import { EstadosAprobacion } from 'src/entities/entities/EstadosAprobacion';
import { Usuarios } from 'src/entities/entities/Usuarios';

@Injectable()
export class PrestamosService {
  constructor(
    @InjectRepository(Prestamos)
    private readonly prestamosRepository: Repository<Prestamos>, // El repositorio de la entidad Prestamos

    @InjectRepository(PresAprobacionPrestamos)
    private readonly aprobacionPrestamoRepository: Repository<PresAprobacionPrestamos>,

    @InjectRepository(PresCuotas)
    private readonly cuotasRepository: Repository<PresCuotas>,

    @InjectRepository(EstadosAprobacion)
    private readonly estadosAprobacionRepository: Repository<EstadosAprobacion>,
  ) {}
  // Obtener todos los prestamos, incluyendo las relaciones
  async getAll(): Promise<Prestamos[]> {
    return this.prestamosRepository.find({
      relations: ['idTasa', 'idAsociado'], // Cargamos las relaciones
    });
  }

  // Obtener un prestamo por id, incluyendo las relaciones
  async getOne(id: number): Promise<Prestamos> {
    const prestamo = await this.prestamosRepository.findOne({
      where: { id },
      relations: ['idTasa'], // Cargamos las relaciones
    });

    if (!prestamo) {
      throw new NotFoundException('Prestamo no encontrado');
    }

    return prestamo;
  }

  // Crear un nuevo prestamo
  async create(prestamoDto: PrestamoDto): Promise<Prestamos> {
    const prestamo = this.prestamosRepository.create(prestamoDto); // Creamos el nuevo objeto prestamo con el DTO
    return this.prestamosRepository.save(prestamo); // Guardamos el objeto en la base de datos
  }

  // Actualizar un prestamo
  async update(
    id: number,
    updatePrestamoDto: UpdatePrestamoDto,
  ): Promise<Prestamos> {
    const prestamo = await this.prestamosRepository.findOne({ where: { id } });
    if (!prestamo) {
      throw new NotFoundException('Prestamo no encontrado');
    }
    Object.assign(prestamo, updatePrestamoDto); // Asignamos los nuevos valores al objeto existente
    return this.prestamosRepository.save(prestamo); // Guardamos el prestamo actualizado
  }

  // Eliminar un prestamo por id
  async deleteOne(id: number): Promise<Prestamos> {
    const prestamo = await this.prestamosRepository.findOne({ where: { id } });
    if (!prestamo) {
      throw new NotFoundException('Prestamo no encontrado');
    }
    return this.prestamosRepository.remove(prestamo); // Eliminamos el prestamo encontrado
  }

  // Obtener los prestamos por id de usuario, incluyendo las relaciones
  async getByUserId(id: number): Promise<Prestamos[]> {
    // Encontramos todos los préstamos que pertenecen al usuario con idAsociado
    const prestamos = await this.prestamosRepository.find({
      where: {
        idAsociado: { id }, // Referencia explícita al campo `id` dentro de la entidad `Asociados`
      },
      relations: [
        'idTasa',
        'idAsociado',
        // 'presCancelaciones',
        // 'presCuotas',
        // 'presPagos',
        // 'PresAprobacionPrestamos',
        // 'presHistorialPrestamos',
      ],
    });

    // Si no se encontraron préstamos, lanzamos una excepción
    if (!prestamos || prestamos.length === 0) {
      throw new NotFoundException(
        'No se encontraron préstamos para este usuario',
      );
    }

    return prestamos;
  }

  async updateStatus(
    id: number,
    updatePrestamoDto: UpdatePrestamoDto,
    usuarioRevisor: any,
  ) {
    // Actualizar el estado del préstamo
    const prestamos = await this.prestamosRepository.find({
      where: { id },
      relations: ['idTasa', 'idAsociado', 'PresAprobacionPrestamos'],
    });

    if (prestamos.length === 0) {
      throw new Error('Prestamo no encontrado');
    }

    let prestamo: Prestamos = prestamos[0];

    const existePlanPagos = await this.cuotasRepository.findOne({
      where: { idPrestamo: prestamo },
    });

    // Si el estado es "APROBADO", generar el plan de pagos
    if (
      !existePlanPagos &&
      prestamo.estado !== updatePrestamoDto.estado &&
      updatePrestamoDto.estado === 'APROBADO'
    ) {
      const estadoAprobacion = await this.estadosAprobacionRepository.findOne({
        where: { nombreEstado: updatePrestamoDto.estado },
      });

      if (!estadoAprobacion) {
        throw new Error('Estado de aprobación no encontrado');
      }

      // Actualizar el estado del préstamo
      prestamo.estado = updatePrestamoDto.estado;
      if (updatePrestamoDto.observaciones) {
        prestamo.observaciones = updatePrestamoDto.observaciones;
      }
      const prestamoDto: Omit<Prestamos, 'PresAprobacionPrestamos'> = prestamo;
      await this.prestamosRepository.save(prestamoDto);

      // Actualizar el estado en la entidad pres_aprobacion_prestamos
      const aprobacionDto: Omit<PresAprobacionPrestamos, 'id'> = {
        fechaRevision: new Date(),
        comentarios: updatePrestamoDto.observaciones,
        fechaModificacion: new Date(),
        idEstadoAprobacion: estadoAprobacion,
        idPrestamo: prestamo,
        usuarioRevisor: usuarioRevisor,
      };

      const aprobacion =
        this.aprobacionPrestamoRepository.create(aprobacionDto);
      const guardarAprobacion =
        await this.aprobacionPrestamoRepository.save(aprobacion);

      if (guardarAprobacion) {
        // Genera el plan de pagos
        await this.generatePaymentPlan(prestamo);
      }
    }

    return prestamo; // Retornar el prestamo actualizado
  }

  // Método para generar el plan de pagos (pres_cuotas)
  private async generatePaymentPlan(prestamo: Prestamos) {
    const monto = parseFloat(prestamo.monto);
    const tasa = parseFloat(prestamo.idTasa.tasa);
    const plazoMeses = prestamo.plazoMeses;

    const cuotaMensual = this.calculateCuotaMensual(monto, tasa, plazoMeses);

    for (let i = 1; i <= plazoMeses; i++) {
      const cuota = new PresCuotas();
      cuota.numeroCuota = i;
      cuota.monto = cuotaMensual;
      cuota.fechaVencimiento = this.calculateVencimientoDate(
        prestamo.fechaCredito,
        i,
      );
      cuota.estado = 'PENDIENTE';

      cuota.idPrestamo = prestamo;
      await this.cuotasRepository.save(cuota);
    }
  }

  // Método de cálculo de cuota mensual (Amortización fija)
  private calculateCuotaMensual(
    monto: number,
    tasa: number,
    plazoMeses: number,
  ): number {
    return (
      (monto * tasa * Math.pow(1 + tasa, plazoMeses)) /
      (Math.pow(1 + tasa, plazoMeses) - 1)
    );
  }

  // Método para calcular la fecha de vencimiento de cada cuota
  private calculateVencimientoDate(
    fechaCredito: Date,
    cuotaNumero: number,
  ): Date {
    const vencimiento = new Date(fechaCredito);
    vencimiento.setMonth(vencimiento.getMonth() + cuotaNumero); // Sumamos el número de meses
    return vencimiento;
  }
}
