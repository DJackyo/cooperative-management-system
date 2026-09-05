import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadosAsociado } from '../../entities/entities/EstadosAsociado';
import { CreateEstadoAsociadoDto } from './dto/create-estado-asociado.dto';
import { UpdateEstadoAsociadoDto } from './dto/update-estado-asociado.dto';

@Injectable()
export class EstadosAsociadoService {
  constructor(
    @InjectRepository(EstadosAsociado)
    private readonly estadosAsociadoRepository: Repository<EstadosAsociado>,
  ) {}

  // Obtener todos los estados de asociado
  async findAll(): Promise<EstadosAsociado[]> {
    return this.estadosAsociadoRepository.find();
  }

  // Obtener un estado de asociado por id
  async findOne(id: number): Promise<EstadosAsociado> {
    const estado = await this.estadosAsociadoRepository.findOne({
      where: { id },
    });
    if (!estado) {
      throw new NotFoundException('Estado de asociado no encontrado');
    }
    return estado;
  }

  // Crear un nuevo estado de asociado
  async create(
    createEstadoAsociadoDto: CreateEstadoAsociadoDto,
  ): Promise<EstadosAsociado> {
    const estado = this.estadosAsociadoRepository.create(
      createEstadoAsociadoDto,
    );
    try {
      return await this.estadosAsociadoRepository.save(estado);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException(
          'Ya existe un estado de asociado con ese id',
        );
      }
      throw err;
    }
  }

  // Actualizar un estado de asociado
  async update(
    id: number,
    updateEstadoAsociadoDto: UpdateEstadoAsociadoDto,
  ): Promise<EstadosAsociado> {
    const estado = await this.findOne(id);
    Object.assign(estado, updateEstadoAsociadoDto);
    try {
      return await this.estadosAsociadoRepository.save(estado);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException(
          'Ya existe un estado de asociado con ese id',
        );
      }
      throw err;
    }
  }

  // Eliminar un estado de asociado
  async remove(id: number): Promise<void> {
    const estado = await this.findOne(id);
    await this.estadosAsociadoRepository.remove(estado);
  }
}