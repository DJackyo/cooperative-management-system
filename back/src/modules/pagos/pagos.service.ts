import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PresCuotas } from 'src/entities/entities/PresCuotas';
import { PresPagos } from 'src/entities/entities/PresPagos';
import { Repository, DataSource } from 'typeorm';
import { PresMetodosPago } from 'src/entities/entities/PresMetodosPago';
import { Prestamos } from 'src/entities/entities/Prestamos';

@Injectable()
export class PagosService implements OnModuleInit {
  constructor(
    @InjectRepository(Prestamos)
    private readonly prestamosRepository: Repository<Prestamos>,
    @InjectRepository(PresPagos)
    private readonly pagosRepository: Repository<PresPagos>,
    @InjectRepository(PresCuotas)
    private readonly cuotasRepository: Repository<PresCuotas>,
    @InjectRepository(PresMetodosPago)
    private readonly metodosPagoRepository: Repository<PresMetodosPago>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.syncSequence('pres_pagos', 'id_pago');
    await this.syncSequence('pres_cuotas', 'id');
  }

  async syncSequence(tableName: string = 'pres_pagos', pkColumn: string = 'id_pago', manager?: any) {
    try {
      const queryRunner = manager || this.dataSource;
      await queryRunner.query(`
        SELECT setval(
          pg_get_serial_sequence('${tableName}', '${pkColumn}'),
          COALESCE((SELECT MAX("${pkColumn}") FROM "${tableName}"), 1)
        );
      `);
      console.log(`✅ Secuencia sincronizada correctamente para ${tableName}.${pkColumn}`);
    } catch (error) {
      console.error(`Error sincronizando secuencia para ${tableName}.${pkColumn}:`, error.message);
    }
  }

  create(createPagoDto: CreatePagoDto) {
    return 'This action adds a new pago';
  }

  findAll() {
    return `This action returns all pagos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pago`;
  }

  async update(id: number, updatePagoDto: UpdatePagoDto) {
    return this.editPago(id, updatePagoDto);
  }

  async editPago(pagoId: number, updateData: any) {
    return await this.dataSource.transaction(async (manager) => {
      const pagoExistente = await manager.findOne(PresPagos, {
        where: { idPago: pagoId },
        relations: ['idCuota', 'metodoPago'],
      });

      if (!pagoExistente) {
        throw new Error('Pago no encontrado');
      }

      if (updateData.metodoPagoId) {
        const metodoPago = await manager.findOne(PresMetodosPago, {
          where: { id: updateData.metodoPagoId },
        });
        if (metodoPago) {
          pagoExistente.metodoPago = metodoPago;
        }
      }

      if (updateData.diaDePago !== undefined) pagoExistente.diaDePago = updateData.diaDePago;
      if (updateData.diasEnMora !== undefined) pagoExistente.diasEnMora = updateData.diasEnMora;
      if (updateData.mora !== undefined) pagoExistente.mora = updateData.mora;
      if (updateData.abonoExtra !== undefined) pagoExistente.abonoExtra = updateData.abonoExtra;
      if (updateData.abonoCapital !== undefined) pagoExistente.abonoCapital = updateData.abonoCapital;
      if (updateData.intereses !== undefined) pagoExistente.intereses = updateData.intereses;
      if (updateData.proteccionCartera !== undefined) pagoExistente.proteccionCartera = updateData.proteccionCartera;
      if (updateData.totalPagado !== undefined) pagoExistente.totalPagado = updateData.totalPagado;
      if (updateData.comprobante !== undefined) pagoExistente.comprobante = updateData.comprobante;

      const pagoGuardado = await manager.save(PresPagos, pagoExistente);

      // Si cambió el abono extra, recalcular las cuotas siguientes
      if (updateData.abonoExtra !== undefined && pagoExistente.idCuota) {
        const prestamo = await manager.findOne(Prestamos, {
          where: { id: pagoExistente.idPrestamo },
          relations: ['idTasa'],
        });
        if (prestamo) {
          await this.recalcularCuotasSiguientes(
            manager,
            prestamo,
            pagoExistente.idCuota.numeroCuota,
            updateData.abonoExtra,
          );
        }
      }

      // Verificar si el préstamo ha finalizado completamente (todas sus cuotas pagadas o canceladas)
      await this.verificarYActualizarEstadoPrestamo(manager, pagoExistente.idPrestamo);

      return pagoGuardado;
    });
  }

  remove(id: number) {
    return `This action removes a #${id} pago`;
  }

  async createByCredit(idCredit: number, createPagoDto: CreatePagoDto) {
    console.log('🚀 === INICIO DE REGISTRO DE PAGO ===');
    console.log('📝 DTO Recibido completo:', JSON.stringify(createPagoDto, null, 2));
    console.log('📊 Tipo de abonoExtra:', typeof createPagoDto.abonoExtra);
    console.log('💰 Valor de abonoExtra:', createPagoDto.abonoExtra);
    console.log('✅ ¿Es mayor a 0?:', createPagoDto.abonoExtra && createPagoDto.abonoExtra > 0);
    
    return await this.dataSource.transaction(async manager => {
      // Convertimos los IDs a entidades
      const prestamo = await manager.findOne(Prestamos, {
        where: { id: idCredit },
        relations: ['idTasa'],
      });
      const cuota = await manager.findOne(PresCuotas, {
        where: { id: createPagoDto.idCuota },
      });

      const metodoPago = await manager.findOne(PresMetodosPago, {
        where: { id: createPagoDto.metodoPagoId },
      });

      if (!cuota) throw new Error('Cuota no encontrada');
      if (!metodoPago) throw new Error('Método de pago no encontrado');
      if (!prestamo) throw new Error('Préstamo no encontrado');

      console.log('🔍 Datos que se van a guardar:', {
        comprobante: createPagoDto.comprobante,
        metodoPagoId: metodoPago.id,
        idCuota: cuota.id,
        numeroCuota: cuota.numeroCuota,
        abonoExtra: createPagoDto.abonoExtra,
        prestamoId: prestamo.id,
        prestamoMonto: prestamo.monto,
      });

      // Crear la entidad con relaciones
      const nuevoPago = manager.create(PresPagos, {
        idCuota: cuota,
        metodoPago: metodoPago,
        idPrestamo: prestamo.id,
        diaDePago: createPagoDto.diaDePago,
        diasEnMora: createPagoDto.diasEnMora,
        mora: createPagoDto.mora,
        abonoExtra: createPagoDto.abonoExtra,
        abonoCapital: createPagoDto.abonoCapital,
        intereses: createPagoDto.intereses,
        monto: createPagoDto.monto,
        totalPagado: createPagoDto.totalPagado,
        proteccionCartera: createPagoDto.proteccionCartera,
        comprobante: createPagoDto.comprobante,
        numCuota: createPagoDto.numCuota,
        fechaVencimiento: createPagoDto.fechaVencimiento,
      });

      console.log('🔍 Entidad creada:', nuevoPago);

      // Sincronizar la secuencia antes de guardar para evitar conflicto de ID
      await this.syncSequence('pres_pagos', 'id_pago', manager);

      // Guardar el pago con reintento automático si ocurre error de clave duplicada
      let pagoGuardado: PresPagos;
      try {
        pagoGuardado = await manager.save(PresPagos, nuevoPago);
      } catch (error) {
        if (error.code === '23505' || error.message?.includes('pagos_pkey')) {
          console.warn('⚠️ Conflicto de secuencia en pagos_pkey detectado, re-sincronizando y reintentando...');
          await this.syncSequence('pres_pagos', 'id_pago', manager);
          pagoGuardado = await manager.save(PresPagos, nuevoPago);
        } else {
          throw error;
        }
      }

      console.log('✅ Pago guardado:', pagoGuardado);

      // Actualizar el estado de la cuota a PAGADO
      await manager.update(PresCuotas, cuota.id, {
        estado: 'PAGADO'
      });

      console.log('✅ Estado de cuota actualizado a PAGADO');

      // 🔥 Si hay abono extra, recalcular las cuotas siguientes
      console.log('🔍 Verificando si hay abono extra...');
      console.log('   abonoExtra:', createPagoDto.abonoExtra);
      console.log('   Tipo:', typeof createPagoDto.abonoExtra);
      console.log('   Es truthy?:', !!createPagoDto.abonoExtra);
      console.log('   Es > 0?:', createPagoDto.abonoExtra > 0);
      console.log('   Condición completa:', createPagoDto.abonoExtra && createPagoDto.abonoExtra > 0);
      
      if (createPagoDto.abonoExtra && createPagoDto.abonoExtra > 0) {
        console.log('💰 ¡SÍ HAY ABONO EXTRA! Iniciando recálculo con:', createPagoDto.abonoExtra);
        await this.recalcularCuotasSiguientes(
          manager, 
          prestamo, 
          cuota.numeroCuota, 
          createPagoDto.abonoExtra
        );
      } else {
        console.log('⚠️ NO se detectó abono extra o es <= 0');
      }

      // Verificar si el préstamo ha finalizado completamente (todas sus cuotas pagadas o canceladas)
      await this.verificarYActualizarEstadoPrestamo(manager, prestamo.id);

      console.log('🏁 === FIN DE REGISTRO DE PAGO ===');
      return pagoGuardado;
    });
  }

  /**
   * Recalcula las cuotas siguientes después de aplicar o editar un abono extra a capital
   * @param manager - Transaction manager de TypeORM
   * @param prestamo - Préstamo al que pertenecen las cuotas
   * @param numeroCuotaPagada - Número de la cuota que se acaba de pagar o editar
   * @param abonoExtra - Monto del abono extra a capital
   */
  private async recalcularCuotasSiguientes(
    manager: any,
    prestamo: Prestamos,
    numeroCuotaPagada: number,
    abonoExtra: number,
  ) {
    console.log('🔄 Iniciando recálculo de cuotas...');
    console.log('📝 Datos de entrada:', {
      prestamoId: prestamo.id,
      numeroCuotaPagada,
      abonoExtra,
      montoOriginalPrestamo: prestamo.monto,
    });

    // Obtener todas las cuotas del préstamo
    const todasLasCuotas = await manager.find(PresCuotas, {
      where: {
        idPrestamo: { id: prestamo.id },
      },
      order: {
        numeroCuota: 'ASC',
      },
    });

    console.log('📊 Total de cuotas encontradas:', todasLasCuotas.length);

    // Identificar todas las cuotas pagadas
    const cuotasPagadas = todasLasCuotas.filter(c => c.estado === 'PAGADO');
    const maxNumeroCuotaPagada = cuotasPagadas.length > 0
      ? Math.max(...cuotasPagadas.map(c => c.numeroCuota))
      : numeroCuotaPagada;

    // Filtrar cuotas no pagadas después de la última cuota pagada (incluye PENDIENTE y CANCELADO)
    const cuotasPendientes = todasLasCuotas.filter(
      c => c.numeroCuota > maxNumeroCuotaPagada && c.estado !== 'PAGADO'
    );

    console.log('📋 Cuotas pendientes/canceladas a recalcular:', cuotasPendientes.length);

    if (cuotasPendientes.length === 0) {
      console.log('⚠️ No hay cuotas pendientes para recalcular');
      return;
    }

    // Calcular el saldo de capital actual restando los abonos a capital de TODAS las cuotas pagadas
    let saldoCapital = prestamo.monto;
    
    console.log('💰 Calculando saldo de capital...');
    console.log('   Monto original del préstamo:', prestamo.monto);
    
    for (const cuotaPagada of cuotasPagadas) {
      console.log(`   Cuota ${cuotaPagada.numeroCuota}: Abono capital = ${cuotaPagada.abonoCapital}`);
      saldoCapital -= cuotaPagada.abonoCapital || 0;
    }
    
    // Restar todos los abonos extra de pagos registrados en cuotas pagadas
    const todosLosPagos = await manager.find(PresPagos, {
      where: {
        idPrestamo: prestamo.id,
      },
      relations: ['idCuota'],
    });
    
    let totalAbonosExtra = 0;
    for (const pago of todosLosPagos) {
      if (pago.idCuota && pago.idCuota.estado === 'PAGADO') {
        const abonoExtraPago = pago.abonoExtra || 0;
        if (abonoExtraPago > 0) {
          console.log(`   Pago de cuota ${pago.idCuota.numeroCuota}: Abono extra = ${abonoExtraPago}`);
          totalAbonosExtra += abonoExtraPago;
        }
      }
    }
    
    console.log('💰 Total de abonos extra en cuotas pagadas:', totalAbonosExtra);
    saldoCapital -= totalAbonosExtra;

    console.log('📊 Saldo de capital restante:', saldoCapital);

    // Si el saldo de capital restante es menor o igual a $100 pesos (remanente insignificante de centavos/redondeos), dar por cancelado el crédito
    if (saldoCapital <= 100) {
      console.log('🎉 El préstamo ha sido cancelado completamente (saldo restante insignificante <= $100)');
      // Marcar todas las cuotas restantes como canceladas
      for (const cuota of cuotasPendientes) {
        await manager.update(PresCuotas, cuota.id, {
          estado: 'CANCELADO',
          monto: 0,
          abonoCapital: 0,
          intereses: 0,
          proteccionCartera: 0,
        });
        console.log(`   ✅ Cuota ${cuota.numeroCuota} marcada como CANCELADA`);
      }
      return;
    }

    // Obtener la tasa de interés y otros parámetros
    const tasa = parseFloat(prestamo.idTasa.tasa);
    const aplicaProteccion = prestamo.aplicaProteccionCartera !== false;
    const porcentajeProteccionCartera = prestamo.porcentajeProteccionCartera || 0.001;

    // Obtener la cuota mensual de la primera cuota
    const primeracuota = todasLasCuotas.find(c => c.numeroCuota === 1);
    const cuotaMensualOriginal = primeracuota ? primeracuota.monto : cuotasPendientes[0].monto;

    console.log('📐 Parámetros para recálculo:', {
      tasa: tasa,
      porcentajeProteccionCartera: porcentajeProteccionCartera,
      cuotaMensualOriginal: cuotaMensualOriginal,
      cuotasRestantes: cuotasPendientes.length,
      estrategia: 'MANTENER cuota mensual, REDUCIR plazo',
    });

    // Recalcular cada cuota pendiente MANTENIENDO la cuota mensual original
    let saldoCapitalActual = saldoCapital;  // Para cálculo de intereses
    let saldoCapitalTmp = saldoCapital; // Para cálculo de protección de cartera
    let ultimaCuotaEncontrada = false; // Flag para marcar cuotas siguientes como CANCELADO
    
    for (const cuota of cuotasPendientes) {
      // Si ya encontramos la última cuota, marcar todas las siguientes como CANCELADAS
      if (ultimaCuotaEncontrada || saldoCapitalActual <= 0.01) {
        await manager.update(PresCuotas, cuota.id, {
          estado: 'CANCELADO',
          monto: 0,
          abonoCapital: 0,
          intereses: 0,
          proteccionCartera: 0,
        });
        console.log(`🚫 Cuota ${cuota.numeroCuota} CANCELADA (préstamo ya pagado)`);
        continue;
      }

      // Calcular intereses sobre el saldo actual
      const nuevosIntereses = saldoCapitalActual * tasa;
      
      // Calcular protección de cartera sobre el saldo actual
      const nuevaProteccionCartera = aplicaProteccion ? saldoCapitalTmp * porcentajeProteccionCartera : 0;
      
      // Calcular abono a capital: cuota - intereses
      let nuevoAbonoCapital = cuotaMensualOriginal - nuevosIntereses;
      
      // Si el abono a capital es mayor que el saldo restante, esta es la última cuota
      let montoFinal = cuotaMensualOriginal;
      if (nuevoAbonoCapital >= saldoCapitalActual) {
        nuevoAbonoCapital = saldoCapitalActual;
        // Última cuota = abono capital + intereses + protección de cartera
        montoFinal = nuevoAbonoCapital + nuevosIntereses + nuevaProteccionCartera;
        ultimaCuotaEncontrada = true;

        if (montoFinal <= 100 || saldoCapitalActual <= 100) {
          console.log(`🎯 Cuota ${cuota.numeroCuota} tiene un monto residual insignificante ($${montoFinal}), se marca como CANCELADA`);
          await manager.update(PresCuotas, cuota.id, {
            estado: 'CANCELADO',
            monto: 0,
            abonoCapital: 0,
            intereses: 0,
            proteccionCartera: 0,
          });
          continue;
        }

        console.log(`🎯 Cuota ${cuota.numeroCuota} será la ÚLTIMA (cuota ajustada: $${Math.round(montoFinal * 100) / 100})`);
      }

      // Redondear a 2 decimales
      const montoRedondeado = Math.round(montoFinal * 100) / 100;
      const interesesRedondeado = Math.round(nuevosIntereses * 100) / 100;
      const abonoCapitalRedondeado = Math.round(nuevoAbonoCapital * 100) / 100;
      const proteccionCarteraRedondeado = Math.round(nuevaProteccionCartera * 100) / 100;

      await manager.update(PresCuotas, cuota.id, {
        estado: 'PENDIENTE',
        monto: montoRedondeado,
        intereses: interesesRedondeado,
        abonoCapital: abonoCapitalRedondeado,
        proteccionCartera: proteccionCarteraRedondeado,
      });

      // Reducir saldos usando valores NO redondeados para mantener precisión en cálculos
      saldoCapitalActual -= nuevoAbonoCapital;
      saldoCapitalTmp -= nuevoAbonoCapital;
    }

    console.log('🎯 Recálculo completado exitosamente');
  }

  /**
   * Verifica si todas las cuotas de un préstamo están PAGADAS o CANCELADAS.
   * De ser así, actualiza el estado del préstamo a 'FINALIZADO'.
   */
  private async verificarYActualizarEstadoPrestamo(manager: any, prestamoId: number) {
    try {
      const cuotas = await manager.find(PresCuotas, {
        where: { idPrestamo: { id: prestamoId } },
      });

      if (!cuotas || cuotas.length === 0) return;

      const cuotasPendientes = cuotas.filter(
        (c: PresCuotas) => c.estado === 'PENDIENTE'
      );

      if (cuotasPendientes.length === 0) {
        await manager.update(Prestamos, prestamoId, {
          estado: 'FINALIZADO',
          fechaActualizacion: new Date(),
        });
        console.log(`🏆 El préstamo #${prestamoId} ha sido actualizado a estado 'FINALIZADO'`);
      }
    } catch (error) {
      console.error(`Error al verificar estado del préstamo #${prestamoId}:`, error);
    }
  }

  /**
   * Calcula la cuota mensual usando el método de amortización francesa
   * @param monto - Monto del capital
   * @param tasa - Tasa de interés mensual (decimal)
   * @param plazoMeses - Número de meses
   * @returns Cuota mensual
   */
  private calculateCuotaMensual(
    monto: number,
    tasa: number,
    plazoMeses: number,
  ): number {
    if (plazoMeses === 0 || tasa === 0) return monto;
    
    return (
      (monto * tasa * Math.pow(1 + tasa, plazoMeses)) /
      (Math.pow(1 + tasa, plazoMeses) - 1)
    );
  }

  async debugCuota(idCuota: number) {
    const cuota = await this.cuotasRepository.findOne({
      where: { id: idCuota }
    });
    return {
      cuota,
      timestamp: new Date().toISOString()
    };
  }

  async updateCuotaStatus(idCuota: number) {
    console.log('🔧 Actualizando manualmente cuota:', idCuota);
    
    const cuotaAntes = await this.cuotasRepository.findOne({
      where: { id: idCuota }
    });
    console.log('📋 Cuota antes:', cuotaAntes);
    
    const updateResult = await this.cuotasRepository.update(idCuota, {
      estado: 'PAGADO'
    });
    console.log('✅ Resultado update:', updateResult);
    
    const cuotaDespues = await this.cuotasRepository.findOne({
      where: { id: idCuota }
    });
    console.log('📋 Cuota después:', cuotaDespues);
    
    return {
      antes: cuotaAntes,
      despues: cuotaDespues,
      updateResult
    };
  }
}
