import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TiposIdentificacion } from '../../entities/entities/TiposIdentificacion';
import { CreateTipoIdentificacionDto } from './dto/create-tipo-identificacion.dto';
import { UpdateTipoIdentificacionDto } from './dto/update-tipo-identificacion.dto';

@Injectable()
export class TiposIdentificacionService {
  constructor(
    @InjectRepository(TiposIdentificacion)
    private readonly tiposIdentificacionRepository: Repository<TiposIdentificacion>,
  ) {}

  // Obtener todos los tipos de identificación
  async findAll(): Promise<TiposIdentificacion[]> {
    return this.tiposIdentificacionRepository.find();
  }

  // Obtener un tipo de identificación por id
  async findOne(id: number): Promise<TiposIdentificacion> {
    const tipo = await this.tiposIdentificacionRepository.findOne({
      where: { id },
    });
    if (!tipo) {
      throw new NotFoundException('Tipo de identificación no encontrado');
    }
    return tipo;
  }

  // Crear un nuevo tipo de identificación
  async create(
    createTipoIdentificacionDto: CreateTipoIdentificacionDto,
  ): Promise<TiposIdentificacion> {
    const tipo = this.tiposIdentificacionRepository.create(
      createTipoIdentificacionDto,
    );
    try {
      return await this.tiposIdentificacionRepository.save(tipo);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException(
          'Ya existe un tipo de identificación con ese nombre',
        );
      }
      throw err;
    }
  }

  // Actualizar un tipo de identificación
  async update(
    id: number,
    updateTipoIdentificacionDto: UpdateTipoIdentificacionDto,
  ): Promise<TiposIdentificacion> {
    const tipo = await this.findOne(id);
    Object.assign(tipo, updateTipoIdentificacionDto);
    try {
      return await this.tiposIdentificacionRepository.save(tipo);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException(
          'Ya existe un tipo de identificación con ese nombre',
        );
      }
      throw err;
    }
  }

  // Eliminar un tipo de identificación
  async remove(id: number): Promise<void> {
    const tipo = await this.findOne(id);
    await this.tiposIdentificacionRepository.remove(tipo);
  }
}