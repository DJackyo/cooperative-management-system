import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PresTasasPrestamo } from 'src/entities/entities/PresTasasPrestamo';
import { Repository } from 'typeorm';

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
}
