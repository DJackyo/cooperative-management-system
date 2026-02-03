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
    return await this.dataSource.transaction(async manager => {
      // Convertimos los IDs a entidades
      const prestamo = await manager.findOne(Prestamos, {
        where: { id: idCredit },
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

      return pagoGuardado;
    });
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
