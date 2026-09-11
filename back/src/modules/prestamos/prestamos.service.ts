import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrestamoDto } from './dto/prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Prestamos } from 'src/entities/entities/Prestamos';
import { Repository } from 'typeorm';
import { PresAprobacionPrestamos } from 'src/entities/entities/PresAprobacionPrestamos';
import { PresCuotas } from 'src/entities/entities/PresCuotas';
import { EstadosAprobacion } from 'src/entities/entities/EstadosAprobacion';
import { PresCancelaciones } from 'src/entities/entities/PresCancelaciones';
import { PresHistorialPrestamos } from 'src/entities/entities/PresHistorialPrestamos';
import { PresPagos } from 'src/entities/entities/PresPagos';

@Injectable()
export class PrestamosService {
  constructor(
    @InjectRepository(Prestamos)
    private readonly prestamosRepository: Repository<Prestamos>,

    @InjectRepository(PresAprobacionPrestamos)
    private readonly aprobacionPrestamoRepository: Repository<PresAprobacionPrestamos>,

    @InjectRepository(PresCuotas)
    private readonly cuotasRepository: Repository<PresCuotas>,

    @InjectRepository(EstadosAprobacion)
    private readonly estadosAprobacionRepository: Repository<EstadosAprobacion>,

    @InjectRepository(PresCancelaciones)
    private readonly cancelacionesRepository: Repository<PresCancelaciones>,

    @InjectRepository(PresHistorialPrestamos)
    private readonly historialPrestamosRepository: Repository<PresHistorialPrestamos>,

    @InjectRepository(PresPagos)
    private readonly pagosRepository: Repository<PresPagos>,
  ) {}
  /* Obtener todos los prestamos, incluyendo las relaciones */
  async getAll(): Promise<Prestamos[]> {
    return this.prestamosRepository.find({
      order: { fechaCredito: 'DESC' },
      relations: [
        'idTasa', 
        'idAsociado', 
        'presCuotas',
        'presCuotas.presPagos'
      ],
    });
  }

  /* Obtener un prestamo por id, incluyendo las relaciones */
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
    if (prestamoDto.idTasa && typeof prestamoDto.idTasa === 'number') {
      prestamoDto.idTasa = { id: prestamoDto.idTasa } as any;
    }
    const prestamo = this.prestamosRepository.create(prestamoDto); // Creamos el nuevo objeto prestamo con el DTO
    return this.prestamosRepository.save(prestamo); // Guardamos el objeto en la base de datos
  }

  // Actualizar un prestamo
  async update(
    id: number,
    updatePrestamoDto: UpdatePrestamoDto,
  ): Promise<Prestamos> {
    const prestamo = await this.prestamosRepository.findOne({
      where: { id },
      relations: ['idTasa', 'presCuotas', 'presCuotas.presPagos'],
    });
    if (!prestamo) {
      throw new NotFoundException('Prestamo no encontrado');
    }
    if (updatePrestamoDto.idTasa && typeof updatePrestamoDto.idTasa === 'number') {
      updatePrestamoDto.idTasa = { id: updatePrestamoDto.idTasa } as any;
    }
    Object.assign(prestamo, updatePrestamoDto); // Asignamos los nuevos valores al objeto existente
    const prestamoGuardado = await this.prestamosRepository.save(prestamo);

    // Si ya tenía cuotas generadas y NO tiene pagos registrados, recalcular las cuotas
    const cuotas = prestamo.presCuotas || [];
    if (cuotas.length > 0) {
      const tienePagos = cuotas.some(
        (cuota) =>
          (cuota.presPagos && cuota.presPagos.length > 0) ||
          cuota.estado === 'PAGADO',
      );
      if (!tienePagos) {
        for (const cuota of cuotas) {
          await this.pagosRepository.delete({ idCuota: { id: cuota.id } });
        }
        await this.cuotasRepository.delete({ idPrestamo: { id: prestamo.id } });
        
        // Cargar entidad completa con idTasa para generar el plan de pagos
        const prestamoCompleto = await this.prestamosRepository.findOne({
          where: { id },
          relations: ['idTasa'],
        });
        if (prestamoCompleto) {
          await this.generatePaymentPlan(prestamoCompleto);
        }
      }
    }

    return prestamoGuardado; // Retornar el prestamo actualizado
  }

  // Recalcular las cuotas del préstamo si no tiene pagos registrados
  async recalcularCuotas(id: number): Promise<Prestamos> {
    const prestamo = await this.prestamosRepository.findOne({
      where: { id },
      relations: ['idTasa', 'idAsociado', 'presCuotas', 'presCuotas.presPagos'],
    });

    if (!prestamo) {
      throw new NotFoundException('Préstamo no encontrado');
    }

    const cuotas = prestamo.presCuotas || [];
    const tienePagos = cuotas.some(
      (cuota) =>
        (cuota.presPagos && cuota.presPagos.length > 0) ||
        cuota.estado === 'PAGADO',
    );

    if (tienePagos) {
      throw new BadRequestException(
        'No se pueden recalcular las cuotas porque el préstamo ya tiene pagos registrados',
      );
    }

    // Eliminar cuotas anteriores
    if (cuotas.length > 0) {
      for (const cuota of cuotas) {
        await this.pagosRepository.delete({ idCuota: { id: cuota.id } });
      }
      await this.cuotasRepository.delete({ idPrestamo: { id: prestamo.id } });
    }

    // Generar el plan de pagos
    await this.generatePaymentPlan(prestamo);

    return this.getOne(id);
  }

  // Eliminar un prestamo por id y todas sus relaciones
  async deleteOne(id: number): Promise<Prestamos> {
    const prestamo = await this.prestamosRepository.findOne({ where: { id } });
    if (!prestamo) {
      throw new NotFoundException('Prestamo no encontrado');
    }

    // 1. Eliminar pagos de todas las cuotas
    const cuotas = await this.cuotasRepository.find({ 
      where: { idPrestamo: { id } },
      relations: ['presPagos']
    });
    
    for (const cuota of cuotas) {
      // Eliminar todos los pagos de la cuota
      await this.pagosRepository.delete({ idCuota: { id: cuota.id } });
    }

    // 2. Eliminar todas las cuotas
    await this.cuotasRepository.delete({ idPrestamo: { id } });

    // 3. Eliminar aprobaciones
    await this.aprobacionPrestamoRepository.delete({ idPrestamo: { id } });

    // 4. Eliminar cancelaciones
    await this.cancelacionesRepository.delete({ idPrestamo: { id } });

    // 5. Eliminar historial
    await this.historialPrestamosRepository.delete({ idPrestamo: { id } });

    // 6. Finalmente eliminar el préstamo
    return this.prestamosRepository.remove(prestamo);
  }

  // Obtener los prestamos por id de usuario, incluyendo las relaciones
  async getByUserId(id: number): Promise<Prestamos[]> {
    // Encontramos todos los préstamos que pertenecen al usuario con idAsociado
    const prestamos = await this.prestamosRepository.find({
      where: {
        idAsociado: { id }, // Referencia explícita al campo `id` dentro de la entidad `Prestamos`
      },
      relations: [
        'idTasa',
        'idAsociado',
        'presCuotas',
        'presCuotas.presPagos',
      ],
    });

    // Si no se encontraron préstamos, retornamos un arreglo vacío (no 404)
    if (!prestamos || prestamos.length === 0) {
      return [];
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
      relations: ['idTasa', 'idAsociado'],
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
      prestamo.fechaCredito = updatePrestamoDto.fechaCredito;
      prestamo.fechaVencimiento = updatePrestamoDto.fechaVencimiento;
      prestamo.fechaDesembolso = updatePrestamoDto.fechaDesembolso
        ? updatePrestamoDto.fechaDesembolso
        : new Date();
      prestamo.fechaActualizacion = updatePrestamoDto.fechaActualizacion
        ? updatePrestamoDto.fechaActualizacion
        : new Date();

      if (updatePrestamoDto.observaciones) {
        prestamo.observaciones = updatePrestamoDto.observaciones;
      }
      if (updatePrestamoDto.aplicaProteccionCartera !== undefined) {
        prestamo.aplicaProteccionCartera = updatePrestamoDto.aplicaProteccionCartera;
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
    const monto = prestamo.monto;
    let saldoCapitalTmp = monto;
    const tasa = parseFloat(prestamo.idTasa.tasa);
    const plazoMeses = prestamo.plazoMeses;
    const aplicaProteccion = prestamo.aplicaProteccionCartera !== false;
    const porcentajeProteccionCartera = prestamo.porcentajeProteccionCartera
      ? prestamo.porcentajeProteccionCartera
      : 0.001;
    let saldoCapital = monto;
    const cuotaMensual = this.calculateCuotaMensual(monto, tasa, plazoMeses);

    for (let i = 1; i <= plazoMeses; i++) {
      const cuota = new PresCuotas();
      cuota.numeroCuota = i;
      cuota.monto = cuotaMensual;
      cuota.intereses = saldoCapital * tasa;
      cuota.abonoCapital = cuotaMensual - cuota.intereses;
      cuota.proteccionCartera = aplicaProteccion
        ? saldoCapitalTmp * porcentajeProteccionCartera
        : 0;
      cuota.fechaVencimiento = this.calculateVencimientoDate(
        prestamo.fechaCredito,
        i,
      );
      cuota.estado = 'PENDIENTE';
      cuota.idPrestamo = prestamo;
      saldoCapital -= cuota.abonoCapital;
      await this.cuotasRepository.save(cuota);
      saldoCapitalTmp -= cuota.abonoCapital;
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

  // Método para obtener los registros filtrados con salida personalizada
  async findWithFilters(filter: {
    userId?: number;
    creditId?: number;
  }): Promise<any> {
    const queryBuilder =
      this.prestamosRepository.createQueryBuilder('prestamos');

    queryBuilder
      .leftJoinAndSelect('prestamos.idAsociado', 'asociados')
      .leftJoinAndSelect('prestamos.idTasa', 'idTasa')
      .leftJoinAndSelect('prestamos.presCuotas', 'cuotas') // 🔹 Relación con PresCuotas
      .leftJoinAndSelect('cuotas.presPagos', 'pagos') // 🔹 Relación entre cuotas y pagos
      .leftJoinAndSelect('pagos.metodoPago', 'metodoPago'); // 🔹 Relación con método de pago

    if (filter.userId && filter.creditId) {
      queryBuilder.where(
        'asociados.id = :userId AND prestamos.id = :creditId',
        {
          userId: filter.userId,
          creditId: filter.creditId,
        },
      );
    } else if (filter.userId) {
      queryBuilder.where('asociados.id = :userId', {
        userId: filter.userId,
      });
    } else if (filter.creditId) {
      queryBuilder.where('prestamos.id = :creditId', {
        creditId: filter.creditId,
      });
    }

    // Obtener los datos de la base de datos
    const prestamos = await queryBuilder.getMany();

    // Personalizar la respuesta antes de enviarla
    return prestamos.map((data) => ({
      ...data,
      tasa: data.idTasa?.tasa,
      idAsociado: {
        id: data.idAsociado.id,
        nombres: [
          data.idAsociado.nombre1,
          data.idAsociado.nombre2,
          data.idAsociado.apellido1,
          data.idAsociado.apellido2,
        ].join(' '),
        numeroDeIdentificacion: data.idAsociado.numeroDeIdentificacion,
        idEstado: data.idAsociado.idEstado,
      },
      presCuotas: data.presCuotas.map((cuota) => ({
        ...cuota,
        pagado: cuota.estado === 'PAGADO', // 🔹 Se marca como pagado basado en el estado real
      })),
    }));
  }
}
