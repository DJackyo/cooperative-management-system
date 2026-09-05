import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsocTiposFamiliares } from '../../entities/entities/AsocTiposFamiliares';
import { CreateTipoFamiliarDto } from './dto/create-tipo-familiar.dto';
import { UpdateTipoFamiliarDto } from './dto/update-tipo-familiar.dto';

@Injectable()
export class TiposFamiliaresService {
  constructor(
    @InjectRepository(AsocTiposFamiliares)
    private readonly tiposFamiliaresRepository: Repository<AsocTiposFamiliares>,
  ) {}

  // Obtener todos los tipos de familiares
  async findAll(): Promise<AsocTiposFamiliares[]> {
    return this.tiposFamiliaresRepository.find();
  }

  // Obtener un tipo de familiar por id
  async findOne(id: number): Promise<AsocTiposFamiliares> {
    const tipo = await this.tiposFamiliaresRepository.findOne({
      where: { id },
    });
    if (!tipo) {
      throw new NotFoundException('Tipo de familiar no encontrado');
    }
    return tipo;
  }

  // Crear un nuevo tipo de familiar
  async create(
    createTipoFamiliarDto: CreateTipoFamiliarDto,
  ): Promise<AsocTiposFamiliares> {
    const tipo = this.tiposFamiliaresRepository.create(createTipoFamiliarDto);
    try {
      return await this.tiposFamiliaresRepository.save(tipo);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException(
          'Ya existe un tipo de familiar con ese nombre',
        );
      }
      throw err;
    }
  }

  // Actualizar un tipo de familiar
  async update(
    id: number,
    updateTipoFamiliarDto: UpdateTipoFamiliarDto,
  ): Promise<AsocTiposFamiliares> {
    const tipo = await this.findOne(id);
    Object.assign(tipo, updateTipoFamiliarDto);
    try {
      return await this.tiposFamiliaresRepository.save(tipo);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException(
          'Ya existe un tipo de familiar con ese nombre',
        );
      }
      throw err;
    }
  }

  // Eliminar un tipo de familiar
  async remove(id: number): Promise<void> {
    const tipo = await this.findOne(id);
    await this.tiposFamiliaresRepository.remove(tipo);
  }
}