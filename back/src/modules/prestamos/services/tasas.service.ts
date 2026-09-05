import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PresTasasPrestamo } from 'src/entities/entities/PresTasasPrestamo';
import { Repository } from 'typeorm';
import { CreateTasaDto } from '../dto/create-tasa.dto';
import { UpdateTasaDto } from '../dto/update-tasa.dto';

@Injectable()
export class TasasService {
  constructor(
    @InjectRepository(PresTasasPrestamo)
    private tasaRepository: Repository<PresTasasPrestamo>,
  ) {}

  // Obtener todas las tasas
  async getTodasLasTasas(): Promise<PresTasasPrestamo[]> {
    try {
      return await this.tasaRepository.find();
    } catch (error) {
      console.error('Error al obtener tasas:', error);
      throw error;
    }
  }

  // Obtener la tasa de un año específico
  async getTasaPorAnio(anio: number): Promise<PresTasasPrestamo> {
    try {
      return await this.tasaRepository.findOne({ where: { anio } });
    } catch (error) {
      console.error('Error al obtener la tasa para el año:', error);
      throw error;
    }
  }

  // Obtener una tasa por id
  async findOne(id: number): Promise<PresTasasPrestamo> {
    const tasa = await this.tasaRepository.findOne({ where: { id } });
    if (!tasa) {
      throw new NotFoundException('Tasa no encontrada');
    }
    return tasa;
  }

  // Crear una nueva tasa
  async create(createTasaDto: CreateTasaDto): Promise<PresTasasPrestamo> {
    const tasa = this.tasaRepository.create(createTasaDto);
    try {
      return await this.tasaRepository.save(tasa);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException('Ya existe una tasa para ese año');
      }
      throw err;
    }
  }

  // Actualizar una tasa
  async update(
    id: number,
    updateTasaDto: UpdateTasaDto,
  ): Promise<PresTasasPrestamo> {
    const tasa = await this.findOne(id);
    Object.assign(tasa, updateTasaDto);
    try {
      return await this.tasaRepository.save(tasa);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException('Ya existe una tasa para ese año');
      }
      throw err;
    }
  }

  // Eliminar una tasa
  async remove(id: number): Promise<void> {
    const tasa = await this.findOne(id);
    await this.tasaRepository.remove(tasa);
  }
}
