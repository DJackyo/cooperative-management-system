import { Injectable } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PresCuotas } from 'src/entities/entities/PresCuotas';
import { PresPagos } from 'src/entities/entities/PresPagos';
import { Repository, DataSource } from 'typeorm';
import { PresMetodosPago } from 'src/entities/entities/PresMetodosPago';
import { Prestamos } from 'src/entities/entities/Prestamos';

@Injectable()
export class PagosService {
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

  create(createPagoDto: CreatePagoDto) {
    return 'This action adds a new pago';
  }

  findAll() {
    return `This action returns all pagos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pago`;
  }

  update(id: number, updatePagoDto: UpdatePagoDto) {
    return `This action updates a #${id} pago`;
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

      // Guardar el pago
      const pagoGuardado = await manager.save(PresPagos, nuevoPago);

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

      console.log('🏁 === FIN DE REGISTRO DE PAGO ===');
      return pagoGuardado;
    });
  }

  /**
   * Recalcula las cuotas siguientes después de aplicar un abono extra a capital
   * @param manager - Transaction manager de TypeORM
   * @param prestamo - Préstamo al que pertenecen las cuotas
   * @param numeroCuotaPagada - Número de la cuota que se acaba de pagar
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

    // Filtrar cuotas pendientes después de la cuota pagada
    const cuotasPendientes = todasLasCuotas.filter(
      c => c.numeroCuota > numeroCuotaPagada && c.estado === 'PENDIENTE'
    );

    console.log('📋 Cuotas pendientes a recalcular:', cuotasPendientes.length);

    if (cuotasPendientes.length === 0) {
      console.log('⚠️ No hay cuotas pendientes para recalcular');
      return;
    }

    // Calcular el saldo de capital actual
    // Saldo = Monto original - suma de todos los abonos a capital hasta la cuota pagada - abono extra
    let saldoCapital = prestamo.monto;
    
    console.log('💰 Calculando saldo de capital...');
    console.log('   Monto original del préstamo:', prestamo.monto);
    
    // Obtener todas las cuotas hasta la cuota recién pagada (incluyéndola)
    const cuotasHastaCuotaPagada = todasLasCuotas.filter(
      c => c.numeroCuota <= numeroCuotaPagada
    );
    
    console.log('   Cuotas hasta la cuota pagada:', cuotasHastaCuotaPagada.length);
    
    // Restar el abono a capital de cada cuota pagada
    for (const cuotaPagada of cuotasHastaCuotaPagada) {
      console.log(`   Cuota ${cuotaPagada.numeroCuota}: Abono capital = ${cuotaPagada.abonoCapital}`);
      saldoCapital -= cuotaPagada.abonoCapital || 0;
    }
    
    // 🔥 IMPORTANTE: También debemos restar todos los abonos extra de pagos anteriores
    const todosLosPagos = await manager.find(PresPagos, {
      where: {
        idPrestamo: prestamo.id,
      },
      relations: ['idCuota'],
    });
    
    console.log('💰 Total de pagos encontrados:', todosLosPagos.length);
    
    // Sumar todos los abonos extra de pagos de cuotas anteriores o igual a la cuota pagada
    // (pero sin contar el abono extra actual que ya lo vamos a restar después)
    let totalAbonosExtraPrevios = 0;
    for (const pago of todosLosPagos) {
      if (pago.idCuota && pago.idCuota.numeroCuota <= numeroCuotaPagada) {
        const abonoExtraPago = pago.abonoExtra || 0;
        if (abonoExtraPago > 0) {
          console.log(`   Pago de cuota ${pago.idCuota.numeroCuota}: Abono extra = ${abonoExtraPago}`);
          totalAbonosExtraPrevios += abonoExtraPago;
        }
      }
    }
    
    console.log('💰 Total de abonos extra previos:', totalAbonosExtraPrevios);
    saldoCapital -= totalAbonosExtraPrevios;
    
    // NOTA: No restamos el abono extra actual porque ya está incluido en totalAbonosExtraPrevios
    // Ya que el pago actual ya se guardó antes de llamar a esta función

    console.log('📊 Saldo de capital después del abono extra:', saldoCapital);

    if (saldoCapital <= 0) {
      console.log('🎉 El préstamo ha sido cancelado completamente');
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
    const porcentajeProteccionCartera = prestamo.porcentajeProteccionCartera || 0.001;

    // 🔥 IMPORTANTE: Obtener la cuota mensual de la PRIMERA cuota (la que se acaba de pagar)
    // La cuota mensual NO cambia, se mantiene la original
    // Solo cambian los intereses (bajan) y el abono a capital (sube)
    const primeracuota = todasLasCuotas.find(c => c.numeroCuota === numeroCuotaPagada);
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
      if (ultimaCuotaEncontrada || saldoCapitalActual <= 0.01) { // Usar 0.01 para evitar problemas de precisión
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
      const nuevaProteccionCartera = saldoCapitalTmp * porcentajeProteccionCartera;
      
      // Calcular abono a capital: cuota - intereses
      let nuevoAbonoCapital = cuotaMensualOriginal - nuevosIntereses;
      
      // Si el abono a capital es mayor que el saldo restante, esta es la última cuota
      let montoFinal = cuotaMensualOriginal;
      if (nuevoAbonoCapital >= saldoCapitalActual) {
        nuevoAbonoCapital = saldoCapitalActual;
        // 🔥 IMPORTANTE: Última cuota = abono capital + intereses + protección de cartera
        montoFinal = nuevoAbonoCapital + nuevosIntereses + nuevaProteccionCartera;
        ultimaCuotaEncontrada = true; // Marcar que esta es la última cuota
        console.log(`🎯 Cuota ${cuota.numeroCuota} será la ÚLTIMA (cuota ajustada: $${Math.round(montoFinal * 100) / 100})`);
      }

      // 🔥 Redondear a 2 decimales para evitar problemas de precisión con REAL/FLOAT
      const montoRedondeado = Math.round(montoFinal * 100) / 100;
      const interesesRedondeado = Math.round(nuevosIntereses * 100) / 100;
      const abonoCapitalRedondeado = Math.round(nuevoAbonoCapital * 100) / 100;
      const proteccionCarteraRedondeado = Math.round(nuevaProteccionCartera * 100) / 100;

      const updateResult = await manager.update(PresCuotas, cuota.id, {
        monto: montoRedondeado,
        intereses: interesesRedondeado,
        abonoCapital: abonoCapitalRedondeado,
        proteccionCartera: proteccionCarteraRedondeado,
      });

      console.log(`📝 UPDATE ejecutado para cuota ${cuota.numeroCuota}:`, {
        affected: updateResult.affected,
        raw: updateResult.raw,
      });

      // Reducir saldos usando valores NO redondeados para mantener precisión en cálculos
      saldoCapitalActual -= nuevoAbonoCapital;
      saldoCapitalTmp -= nuevoAbonoCapital;

      console.log(`✅ Cuota ${cuota.numeroCuota} recalculada:`, {
        montoAnterior: cuota.monto,
        montoNuevo: montoRedondeado,
        diferenciaMonto: montoRedondeado - cuota.monto,
        interesesAnterior: cuota.intereses,
        interesesNuevo: interesesRedondeado,
        diferenciaIntereses: interesesRedondeado - cuota.intereses,
        abonoCapitalAnterior: cuota.abonoCapital,
        abonoCapitalNuevo: abonoCapitalRedondeado,
        diferenciaAbonoCapital: abonoCapitalRedondeado - cuota.abonoCapital,
        proteccionCarteraAnterior: cuota.proteccionCartera,
        proteccionCarteraNueva: proteccionCarteraRedondeado,
        saldoRestante: saldoCapitalActual,
      });
    }

    console.log('🎯 Recálculo completado exitosamente');
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
