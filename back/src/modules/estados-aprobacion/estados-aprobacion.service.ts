import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadosAprobacion } from '../../entities/entities/EstadosAprobacion';
import { CreateEstadoAprobacionDto } from './dto/create-estado-aprobacion.dto';
import { UpdateEstadoAprobacionDto } from './dto/update-estado-aprobacion.dto';

@Injectable()
export class EstadosAprobacionService {
  constructor(
    @InjectRepository(EstadosAprobacion)
    private readonly estadosAprobacionRepository: Repository<EstadosAprobacion>,
  ) {}

  // Obtener todos los estados de aprobación
  async findAll(): Promise<EstadosAprobacion[]> {
    return this.estadosAprobacionRepository.find();
  }

  // Obtener un estado de aprobación por id
  async findOne(id: number): Promise<EstadosAprobacion> {
    const estado = await this.estadosAprobacionRepository.findOne({
      where: { id },
    });
    if (!estado) {
      throw new NotFoundException('Estado de aprobación no encontrado');
    }
    return estado;
  }

  // Crear un nuevo estado de aprobación
  async create(
    createEstadoAprobacionDto: CreateEstadoAprobacionDto,
  ): Promise<EstadosAprobacion> {
    const estado = this.estadosAprobacionRepository.create(
      createEstadoAprobacionDto,
    );
    try {
      return await this.estadosAprobacionRepository.save(estado);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException(
          'Ya existe un estado de aprobación con ese nombre',
        );
      }
      throw err;
    }
  }

  // Actualizar un estado de aprobación
  async update(
    id: number,
    updateEstadoAprobacionDto: UpdateEstadoAprobacionDto,
  ): Promise<EstadosAprobacion> {
    const estado = await this.findOne(id);
    Object.assign(estado, updateEstadoAprobacionDto);
    try {
      return await this.estadosAprobacionRepository.save(estado);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException(
          'Ya existe un estado de aprobación con ese nombre',
        );
      }
      throw err;
    }
  }

  // Eliminar un estado de aprobación
  async remove(id: number): Promise<void> {
    const estado = await this.findOne(id);
    await this.estadosAprobacionRepository.remove(estado);
  }
}