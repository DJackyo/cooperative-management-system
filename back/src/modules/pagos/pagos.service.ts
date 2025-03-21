import { Injectable } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PresCuotas } from 'src/entities/entities/PresCuotas';
import { PresPagos } from 'src/entities/entities/PresPagos';
import { Repository } from 'typeorm';
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
    // Convertimos los IDs a entidades
    const prestamo = await this.prestamosRepository.findOne({
      where: { id: idCredit },
    });
    const cuota = await this.cuotasRepository.findOne({
      where: { id: createPagoDto.idCuota },
    });

    const metodoPago = await this.metodosPagoRepository.findOne({
      where: { id: createPagoDto.metodoPagoId },
    });

    if (!cuota) throw new Error('Cuota no encontrada');
    if (!metodoPago) throw new Error('Método de pago no encontrado');

    // Crear la entidad con relaciones
    const nuevoPago = this.pagosRepository.create({
      ...createPagoDto,
      idCuota: cuota,
      metodoPago: metodoPago,
      idPrestamo: prestamo.id,
    });

    return this.pagosRepository.save(nuevoPago);
  }
}
