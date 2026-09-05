import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PresMetodosPago } from '../../entities/entities/PresMetodosPago';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo-pago.dto';

@Injectable()
export class MetodosPagoService {
  constructor(
    @InjectRepository(PresMetodosPago)
    private readonly metodosPagoRepository: Repository<PresMetodosPago>,
  ) {}

  // Obtener todos los métodos de pago
  async findAll(): Promise<PresMetodosPago[]> {
    return this.metodosPagoRepository.find();
  }

  // Obtener un método de pago por id
  async findOne(id: number): Promise<PresMetodosPago> {
    const metodo = await this.metodosPagoRepository.findOne({
      where: { id },
    });
    if (!metodo) {
      throw new NotFoundException('Método de pago no encontrado');
    }
    return metodo;
  }

  // Crear un nuevo método de pago
  async create(
    createMetodoPagoDto: CreateMetodoPagoDto,
  ): Promise<PresMetodosPago> {
    const metodo = this.metodosPagoRepository.create(createMetodoPagoDto);
    try {
      return await this.metodosPagoRepository.save(metodo);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException(
          'Ya existe un método de pago con ese nombre',
        );
      }
      throw err;
    }
  }

  // Actualizar un método de pago
  async update(
    id: number,
    updateMetodoPagoDto: UpdateMetodoPagoDto,
  ): Promise<PresMetodosPago> {
    const metodo = await this.findOne(id);
    Object.assign(metodo, updateMetodoPagoDto);
    try {
      return await this.metodosPagoRepository.save(metodo);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException(
          'Ya existe un método de pago con ese nombre',
        );
      }
      throw err;
    }
  }

  // Eliminar un método de pago
  async remove(id: number): Promise<void> {
    const metodo = await this.findOne(id);
    await this.metodosPagoRepository.remove(metodo);
  }
}