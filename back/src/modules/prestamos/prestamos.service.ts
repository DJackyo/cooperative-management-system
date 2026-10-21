import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrestamoDto } from './dto/prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';
import { RetanqueoDto } from './dto/retanqueo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Prestamos } from 'src/entities/entities/Prestamos';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { PresAprobacionPrestamos } from 'src/entities/entities/PresAprobacionPrestamos';
import { PresCuotas } from 'src/entities/entities/PresCuotas';
import { EstadosAprobacion } from 'src/entities/entities/EstadosAprobacion';
import { PresCancelaciones } from 'src/entities/entities/PresCancelaciones';
import { PresHistorialPrestamos } from 'src/entities/entities/PresHistorialPrestamos';
import { PresPagos } from 'src/entities/entities/PresPagos';
import { PresRetanqueos } from 'src/entities/entities/PresRetanqueos';

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

    @InjectRepository(PresRetanqueos)
    private readonly retanqueosRepository: Repository<PresRetanqueos>,

    private readonly dataSource: DataSource,
  ) {}
  /* Obtener todos los prestamos, incluyendo las relaciones */
  async getAll(): Promise<Prestamos[]> {
    return this.prestamosRepository.find({
      order: { fechaCredito: 'DESC' },
      relations: [
        'idTasa', 
        'idAsociado', 
        'idPrestamoOrigen',
        'presCuotas',
        'presCuotas.presPagos'
      ],
    });
  }

  /* Obtener un prestamo por id, incluyendo las relaciones */
  async getOne(id: number): Promise<Prestamos> {
    const prestamo = await this.prestamosRepository.findOne({
      where: { id },
      relations: [
        'idTasa',
        'idAsociado',
        'idPrestamoOrigen',
        'presCuotas',
        'presCuotas.presPagos',
      ],
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
    if (prestamoDto.idPrestamoOrigen && typeof prestamoDto.idPrestamoOrigen === 'number') {
      prestamoDto.idPrestamoOrigen = { id: prestamoDto.idPrestamoOrigen } as any;
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
    if (updatePrestamoDto.idPrestamoOrigen && typeof updatePrestamoDto.idPrestamoOrigen === 'number') {
      updatePrestamoDto.idPrestamoOrigen = { id: updatePrestamoDto.idPrestamoOrigen } as any;
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
      order: { fechaCredito: 'DESC' },
      relations: [
        'idTasa',
        'idAsociado',
        'idPrestamoOrigen',
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
      relations: ['idTasa', 'idAsociado', 'idPrestamoOrigen'],
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

      // La aprobación, el plan de pagos y la liquidación del crédito origen
      // (cuando es retanqueo) se ejecutan de forma atómica.
      await this.dataSource.transaction(async (manager) => {
        await manager.getRepository(Prestamos).save(prestamoDto);

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
          manager.getRepository(PresAprobacionPrestamos).create(aprobacionDto);
        const guardarAprobacion = await manager
          .getRepository(PresAprobacionPrestamos)
          .save(aprobacion);

        if (guardarAprobacion) {
          // Genera el plan de pagos
          await this.generatePaymentPlan(prestamo, manager);

          // Si es retanqueo, liquidar el préstamo origen
          if (prestamo.esRetanqueo && prestamo.idPrestamoOrigen) {
            const idOrigen =
              typeof prestamo.idPrestamoOrigen === 'object'
                ? prestamo.idPrestamoOrigen.id
                : prestamo.idPrestamoOrigen;
            await this.liquidarCreditoAnterior(idOrigen, prestamo, manager);
          }
        }
      });
    }

    return prestamo; // Retornar el prestamo actualizado
  }

  // Método para generar el plan de pagos (pres_cuotas)
  private async generatePaymentPlan(
    prestamo: Prestamos,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(PresCuotas) : this.cuotasRepository;
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
      await repo.save(cuota);
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
      .leftJoinAndSelect('prestamos.idPrestamoOrigen', 'idPrestamoOrigen')
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
      idPrestamoOrigen: data.idPrestamoOrigen
        ? {
            id: data.idPrestamoOrigen.id,
            monto: data.idPrestamoOrigen.monto,
            fechaCredito: data.idPrestamoOrigen.fechaCredito,
          }
        : null,
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

  // Calcular la liquidación de un préstamo para retanqueo o pago total
  async calcularLiquidacionPrestamo(id: number) {
    const prestamo = await this.prestamosRepository.findOne({
      where: { id },
      relations: ['idTasa', 'idAsociado', 'presCuotas', 'presCuotas.presPagos'],
    });

    if (!prestamo) {
      throw new NotFoundException('Préstamo no encontrado');
    }

    const cuotas = (prestamo.presCuotas || []).slice().sort((a, b) => a.numeroCuota - b.numeroCuota);
    const cuotasPagadas = cuotas.filter((c) => c.estado === 'PAGADO');
    const cuotasPendientes = cuotas.filter((c) => c.estado === 'PENDIENTE');

    // 1. Capital pagado en cuotas normales
    let totalCapitalPagado = cuotasPagadas.reduce(
      (sum, c) => sum + (Number(c.abonoCapital) || 0),
      0,
    );

    // 2. Abonos extra a capital y total de intereses pagados
    let totalAbonosExtra = 0;
    let totalInteresesPagados = 0;
    for (const c of cuotas) {
      if (c.presPagos && c.presPagos.length > 0) {
        for (const p of c.presPagos) {
          totalAbonosExtra += Number(p.abonoExtra) || 0;
          totalInteresesPagados += Number(p.intereses) || 0;
        }
      } else if (c.estado === 'PAGADO') {
        totalInteresesPagados += Number(c.intereses) || 0;
      }
    }

    // 3. Saldo a capital restante
    let saldoCapital = prestamo.monto - totalCapitalPagado - totalAbonosExtra;
    if (saldoCapital < 0) saldoCapital = 0;

    // 4. Cuotas vencidas (intereses devengados o mora)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let cuotasVencidas = 0;
    let interesesVencidos = 0;
    let moraTotal = 0;

    for (const c of cuotasPendientes) {
      if (c.fechaVencimiento) {
        const dueDate = new Date(c.fechaVencimiento);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          cuotasVencidas++;
          interesesVencidos += Number(c.intereses) || 0;
          if (c.presPagos && c.presPagos.length > 0) {
            for (const p of c.presPagos) {
              moraTotal += Number(p.mora) || 0;
            }
          }
        }
      }
    }

    const totalALiquidar = Math.round((saldoCapital + interesesVencidos + moraTotal) * 100) / 100;

    return {
      prestamoId: prestamo.id,
      asociado: prestamo.idAsociado
        ? {
            id: prestamo.idAsociado.id,
            nombres: [
              prestamo.idAsociado.nombre1,
              prestamo.idAsociado.nombre2,
              prestamo.idAsociado.apellido1,
              prestamo.idAsociado.apellido2,
            ]
              .filter(Boolean)
              .join(' '),
            numeroDeIdentificacion: prestamo.idAsociado.numeroDeIdentificacion,
          }
        : null,
      montoOriginal: prestamo.monto,
      plazoMeses: prestamo.plazoMeses,
      tasa: prestamo.idTasa?.tasa,
      cuotasTotales: cuotas.length,
      cuotasPagadas: cuotasPagadas.length,
      cuotasPendientes: cuotasPendientes.length,
      cuotasVencidas,
      totalCapitalPagado: Math.round(totalCapitalPagado * 100) / 100,
      totalAbonosExtra: Math.round(totalAbonosExtra * 100) / 100,
      totalInteresesPagados: Math.round(totalInteresesPagados * 100) / 100,
      saldoCapital: Math.round(saldoCapital * 100) / 100,
      interesesVencidos: Math.round(interesesVencidos * 100) / 100,
      moraTotal: Math.round(moraTotal * 100) / 100,
      totalALiquidar,
    };
  }

  // Liquidar y cancelar el crédito anterior que fue absorbido por retanqueo
  private async liquidarCreditoAnterior(
    idPrestamoOrigen: number,
    nuevoPrestamo: Prestamos,
    manager?: EntityManager,
  ): Promise<boolean> {
    const prestamosRepo = manager
      ? manager.getRepository(Prestamos)
      : this.prestamosRepository;
    const cuotasRepo = manager
      ? manager.getRepository(PresCuotas)
      : this.cuotasRepository;
    const cancelacionesRepo = manager
      ? manager.getRepository(PresCancelaciones)
      : this.cancelacionesRepository;
    const historialRepo = manager
      ? manager.getRepository(PresHistorialPrestamos)
      : this.historialPrestamosRepository;

    // Bloqueo pesimista para evitar liquidaciones dobles concurrentes
    if (manager) {
      await manager.query('SELECT id FROM prestamos WHERE id = $1 FOR UPDATE', [
        idPrestamoOrigen,
      ]);
    }

    const prestamoOrigen = await prestamosRepo.findOne({
      where: { id: idPrestamoOrigen },
      relations: ['presCuotas', 'presCuotas.presPagos'],
    });

    if (!prestamoOrigen) {
      console.warn(`Préstamo origen #${idPrestamoOrigen} no encontrado al liquidar retanqueo`);
      return false;
    }

    if (prestamoOrigen.estado === 'FINALIZADO') {
      console.log(`Préstamo origen #${idPrestamoOrigen} ya estaba finalizado`);
      return false;
    }

    const estadoAnterior = prestamoOrigen.estado;
    const liquidacion = await this.calcularLiquidacionPrestamo(idPrestamoOrigen);
    const montoLiquidado = nuevoPrestamo.saldoRetanqueo || liquidacion.totalALiquidar;

    // Marcar cuotas pendientes como CANCELADO
    const cuotas = prestamoOrigen.presCuotas || [];
    for (const cuota of cuotas) {
      if (cuota.estado === 'PENDIENTE') {
        cuota.estado = 'CANCELADO';
        await cuotasRepo.save(cuota);
      }
    }

    // Finalizar el préstamo origen
    prestamoOrigen.estado = 'FINALIZADO';
    prestamoOrigen.fechaActualizacion = new Date();
    const obsCancelacion = `Cancelado por retanqueo mediante nuevo crédito #${nuevoPrestamo.id} el ${new Date().toLocaleDateString('es-CO')}. Saldo liquidado: $${Math.round(montoLiquidado)}.`;
    prestamoOrigen.observaciones = prestamoOrigen.observaciones
      ? `${prestamoOrigen.observaciones} | ${obsCancelacion}`
      : obsCancelacion;
    await prestamosRepo.save(prestamoOrigen);

    // Registrar en pres_cancelaciones
    const cancelacion = cancelacionesRepo.create({
      idPrestamo: prestamoOrigen,
      montoCancelado: Math.round(montoLiquidado),
      fechaCancelacion: new Date(),
    });
    await cancelacionesRepo.save(cancelacion);

    // Registro en el historial del crédito origen (liquidación por retanqueo).
    // Se hace aquí para que todos los flujos que liquidan un crédito por
    // retanqueo queden auditados, no solo el flujo principal transaccional.
    await historialRepo.save(
      historialRepo.create({
        campoModificado: 'estado',
        valorAnterior: estadoAnterior,
        nuevoValor: 'FINALIZADO',
        fechaModificacion: new Date(),
        idPrestamo: prestamoOrigen,
      }),
    );

    console.log(`✅ Crédito #${idPrestamoOrigen} liquidado exitosamente por retanqueo con crédito #${nuevoPrestamo.id}`);
    return true;
  }

  // Obtener créditos activos que pueden ser retanqueados para un asociado
  async getCreditosRetanqueables(userId: number) {
    const prestamos = await this.prestamosRepository.find({
      where: {
        idAsociado: { id: userId },
        estado: 'APROBADO',
      },
      order: { fechaCredito: 'DESC' },
      relations: [
        'idTasa',
        'idAsociado',
        'presCuotas',
        'presCuotas.presPagos',
      ],
    });

    const resultado = [];
    for (const p of prestamos) {
      const liquidacion = await this.calcularLiquidacionPrestamo(p.id);
      if (liquidacion.totalALiquidar > 0) {
        resultado.push({
          ...p,
          tasa: p.idTasa?.tasa,
          idAsociado: p.idAsociado
            ? {
                id: p.idAsociado.id,
                nombres: [
                  p.idAsociado.nombre1,
                  p.idAsociado.nombre2,
                  p.idAsociado.apellido1,
                  p.idAsociado.apellido2,
                ]
                  .filter(Boolean)
                  .join(' '),
                numeroDeIdentificacion: p.idAsociado.numeroDeIdentificacion,
              }
            : null,
          liquidacion,
        });
      }
    }
    return resultado;
  }

  // Procesar un retanqueo (crea el nuevo crédito y, si es aprobado, liquida el anterior)
  async procesarRetanqueo(dto: RetanqueoDto, usuario?: any): Promise<Prestamos> {
    const prestamoOrigen = await this.prestamosRepository.findOne({
      where: { id: dto.idPrestamoOrigen },
      relations: ['idAsociado', 'idTasa', 'presCuotas', 'presCuotas.presPagos'],
    });

    if (!prestamoOrigen) {
      throw new NotFoundException('El crédito a retanquear no existe');
    }

    if (prestamoOrigen.estado !== 'APROBADO') {
      throw new BadRequestException(
        `Solo se pueden retanquear créditos en estado APROBADO (el estado actual es ${prestamoOrigen.estado})`,
      );
    }

    const liquidacion = await this.calcularLiquidacionPrestamo(dto.idPrestamoOrigen);
    if (dto.montoNuevo <= liquidacion.totalALiquidar) {
      throw new BadRequestException(
        `El nuevo monto ($${dto.montoNuevo}) debe ser mayor al saldo a liquidar del crédito anterior ($${Math.round(liquidacion.totalALiquidar)})`,
      );
    }

    const idAsociado = { id: dto.idAsociado || prestamoOrigen.idAsociado.id } as any;
    const idTasa = dto.idTasa
      ? (typeof dto.idTasa === 'number' ? { id: dto.idTasa } : dto.idTasa)
      : prestamoOrigen.idTasa;

    const estadoNuevo = dto.estado || 'APROBADO';
    const fechaCredito = dto.fechaCredito ? new Date(dto.fechaCredito) : new Date();
    const fechaDesembolso = dto.fechaDesembolso ? new Date(dto.fechaDesembolso) : new Date();
    const fechaVencimiento = dto.fechaVencimiento
      ? new Date(dto.fechaVencimiento)
      : this.calculateVencimientoDate(fechaCredito, dto.plazoMeses);

    const saldoLiquidado = Math.round(liquidacion.totalALiquidar);
    const desembolsoNeto = Math.round(dto.montoNuevo - saldoLiquidado);

    const resumen =
      `Retanqueo de crédito #${prestamoOrigen.id}. Saldo liquidado: $${saldoLiquidado}. Desembolso neto: $${desembolsoNeto}.`;

    // Toda la operación del retanqueo se ejecuta dentro de una única transacción
    const resultado = await this.dataSource.transaction(async (manager) => {
      const prestamosRepo = manager.getRepository(Prestamos);
      const aprobacionRepo = manager.getRepository(PresAprobacionPrestamos);
      const estadosRepo = manager.getRepository(EstadosAprobacion);
      const historialRepo = manager.getRepository(PresHistorialPrestamos);
      const retanqueosRepo = manager.getRepository(PresRetanqueos);

      // Bloqueo pesimista (SELECT ... FOR UPDATE) sobre el crédito origen.
      // Sin esto, dos retanqueos concurrentes sobre el mismo crédito podrían
      // validar el estado 'APROBADO' antes de que cualquiera de los dos liquide,
      // provocando liquidaciones dobles y créditos duplicados.
      await manager.query(
        'SELECT id FROM prestamos WHERE id = $1 FOR UPDATE',
        [dto.idPrestamoOrigen],
      );

      // Revalidación del estado dentro de la transacción (tras el bloqueo)
      const origenBloqueado = await prestamosRepo.findOne({
        where: { id: dto.idPrestamoOrigen },
      });

      if (!origenBloqueado) {
        throw new NotFoundException('El crédito a retanquear no existe');
      }

      if (origenBloqueado.estado !== 'APROBADO') {
        throw new BadRequestException(
          `El crédito a retanquear ya fue liquidado o no está APROBADO (estado actual: ${origenBloqueado.estado})`,
        );
      }

      const nuevoPrestamo = prestamosRepo.create({
        idAsociado,
        idTasa,
        monto: dto.montoNuevo,
        plazoMeses: dto.plazoMeses,
        fechaCredito,
        fechaDesembolso,
        fechaVencimiento,
        fechaSolicitud: new Date(),
        fechaActualizacion: new Date(),
        estado: estadoNuevo,
        esRetanqueo: true,
        saldoRetanqueo: saldoLiquidado,
        idPrestamoOrigen: prestamoOrigen,
        aplicaProteccionCartera: dto.aplicaProteccionCartera !== false,
        observaciones: dto.observaciones
          ? `${dto.observaciones} | ${resumen}`
          : resumen,
      });

      const guardado = await prestamosRepo.save(nuevoPrestamo);

        let creditoLiquidado = false;
        if (estadoNuevo === 'APROBADO') {
          const estadoAprobacion = await estadosRepo.findOne({
            where: { nombreEstado: 'APROBADO' },
          });

          if (estadoAprobacion) {
            const aprobacion = aprobacionRepo.create({
              fechaRevision: new Date(),
              comentarios: `Aprobado como retanqueo de crédito #${prestamoOrigen.id}`,
              fechaModificacion: new Date(),
              idEstadoAprobacion: estadoAprobacion,
              idPrestamo: guardado,
              usuarioRevisor: usuario,
            });
            await aprobacionRepo.save(aprobacion);
          }

          const prestamoConRelaciones = await prestamosRepo.findOne({
            where: { id: guardado.id },
            relations: ['idTasa'],
          });
          if (prestamoConRelaciones) {
            await this.generatePaymentPlan(prestamoConRelaciones, manager);
          }

          creditoLiquidado = await this.liquidarCreditoAnterior(
            prestamoOrigen.id,
            guardado,
            manager,
          );
        }

        // El historial 'FINALIZADO' del crédito origen se registra dentro de
        // liquidarCreditoAnterior(), de modo que también queda auditado el
        // flujo alternativo de aprobación (updateStatus).
        void creditoLiquidado;

      // Traza persistente del retanqueo
      const numeroRecibo = await this.generarNumeroRecibo(manager);
      const traza = retanqueosRepo.create({
        fechaRetanqueo: new Date(),
        idPrestamoOrigen: prestamoOrigen,
        idPrestamoNuevo: guardado,
        idAsociado: { id: idAsociado.id } as any,
        idUsuario: usuario ? ({ id: usuario.id } as any) : null,
        montoOrigen: prestamoOrigen.monto,
        montoNuevo: dto.montoNuevo,
        saldoLiquidado,
        desembolsoNeto,
        plazoMeses: dto.plazoMeses,
        estado: estadoNuevo,
        detalleLiquidacion: JSON.stringify(liquidacion),
        observaciones: dto.observaciones ?? null,
        numeroRecibo,
      });
      const trazaGuardada = await retanqueosRepo.save(traza);

      return { prestamoId: guardado.id, trazaId: trazaGuardada.id, numeroRecibo };
    });

    return this.getOne(resultado.prestamoId);
  }

  // Genera un número de recibo correlativo y único para el retanqueo.
  // Se ejecuta dentro de la transacción del retanqueo y usa un advisory lock
  // por año para evitar colisiones de consecutivo entre transacciones concurrentes.
  private async generarNumeroRecibo(manager?: EntityManager): Promise<string> {
    const repo = manager
      ? manager.getRepository(PresRetanqueos)
      : this.retanqueosRepository;

    const anio = new Date().getFullYear();
    const prefijo = `RTQ-${anio}`;

    // Serializa a los procesos que generan recibos del mismo año.
    if (manager) {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [prefijo]);
    }

    const ultimo = await repo
      .createQueryBuilder('retanqueo')
      .where('retanqueo.numero_recibo LIKE :prefijo', {
        prefijo: `${prefijo}-%`,
      })
      .orderBy('retanqueo.numero_recibo', 'DESC')
      .getOne();

    const consecutivo = ultimo
      ? parseInt(ultimo.numeroRecibo.split('-').pop() || '0', 10) + 1
      : 1;

    return `${prefijo}-${String(consecutivo).padStart(6, '0')}`;
  }

  // Obtiene el historial de retanqueos de un crédito (origen o nuevo)
  async getRetanqueosDePrestamo(idPrestamo: number) {
    return this.retanqueosRepository.find({
      where: [
        { idPrestamoOrigen: { id: idPrestamo } },
        { idPrestamoNuevo: { id: idPrestamo } },
      ],
      relations: [
        'idPrestamoOrigen',
        'idPrestamoNuevo',
        'idAsociado',
        'idUsuario',
      ],
      order: { fechaRetanqueo: 'DESC' },
    });
  }

  // Obtiene todas las trazas de retanqueo, opcionalmente filtradas por asociado
  async getRetanqueos(idAsociado?: number) {
    const qb = this.retanqueosRepository
      .createQueryBuilder('retanqueo')
      .leftJoinAndSelect('retanqueo.idPrestamoOrigen', 'prestamoOrigen')
      .leftJoinAndSelect('retanqueo.idPrestamoNuevo', 'prestamoNuevo')
      .leftJoinAndSelect('retanqueo.idAsociado', 'asociado')
      .leftJoinAndSelect('retanqueo.idUsuario', 'usuario')
      .orderBy('retanqueo.fechaRetanqueo', 'DESC');

    if (idAsociado) {
      qb.where('asociado.id = :idAsociado', { idAsociado });
    }

    return qb.getMany();
  }

  // Obtiene una traza de retanqueo por su identificador
  async getRetanqueoById(id: number) {
    const traza = await this.retanqueosRepository.findOne({
      where: { id },
      relations: [
        'idPrestamoOrigen',
        'idPrestamoNuevo',
        'idAsociado',
        'idUsuario',
      ],
    });

    if (!traza) {
      throw new NotFoundException('El registro de retanqueo no existe');
    }

    return traza;
  }

  // Obtiene los datos necesarios para el recibo PDF del retanqueo
  async getDatosReciboRetanqueo(id: number) {
    const traza = await this.getRetanqueoById(id);

    let liquidacion: any = null;
    if (traza.detalleLiquidacion) {
      try {
        liquidacion = JSON.parse(traza.detalleLiquidacion);
      } catch {
        liquidacion = null;
      }
    }

    const asociado = traza.idAsociado as any;
    const nombreAsociado = asociado
      ? [
          asociado.nombre1,
          asociado.nombre2,
          asociado.apellido1,
          asociado.apellido2,
        ]
          .filter(Boolean)
          .join(' ')
      : null;

    return {
      numeroRecibo: traza.numeroRecibo || `RTQ-${traza.id}`,
      fechaRetanqueo: traza.fechaRetanqueo,
      asociado: asociado
        ? {
            id: asociado.id,
            nombres: nombreAsociado,
            numeroDeIdentificacion: asociado.numeroDeIdentificacion,
          }
        : null,
      prestamoOrigen: traza.idPrestamoOrigen
        ? {
            id: traza.idPrestamoOrigen.id,
            monto: traza.idPrestamoOrigen.monto,
            plazoMeses: traza.idPrestamoOrigen.plazoMeses,
            fechaCredito: traza.idPrestamoOrigen.fechaCredito,
          }
        : null,
      prestamoNuevo: traza.idPrestamoNuevo
        ? {
            id: traza.idPrestamoNuevo.id,
            monto: traza.idPrestamoNuevo.monto,
            plazoMeses: traza.idPrestamoNuevo.plazoMeses,
            fechaCredito: traza.idPrestamoNuevo.fechaCredito,
          }
        : null,
      montoOrigen: Number(traza.montoOrigen) || 0,
      montoNuevo: Number(traza.montoNuevo) || 0,
      saldoLiquidado: Number(traza.saldoLiquidado) || 0,
      desembolsoNeto: Number(traza.desembolsoNeto) || 0,
      plazoMeses: Number(traza.plazoMeses) || 0,
      estado: traza.estado || '-',
      observaciones: traza.observaciones,
      liquidacion,
    };
  }
}
