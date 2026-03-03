import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asociados } from '../../entities/entities/Asociados';
import { AsociadoDto } from './dto/asociado.dto';
import { UpdateAsociadoDto } from './dto/update-asociado.dto';

@Injectable()
export class AsociadosService {
  constructor(
    @InjectRepository(Asociados)
    private readonly asociadosRepository: Repository<Asociados>,  // El repositorio de la entidad Asociados
  ) {}

  // Obtener todos los asociados, incluyendo las relaciones
  async getAll(): Promise<Asociados[]> {
    return this.asociadosRepository.find({
      relations: ['tipoIdentificacion', 'idEstado'],  // Cargamos las relaciones
    });
  }

  // Obtener un asociado por id, incluyendo las relaciones
  async getOne(id: number): Promise<Asociados> {
    const asociado = await this.asociadosRepository.findOne({
      where: { id },
      relations: ['tipoIdentificacion', 'idEstado'],  // Cargamos las relaciones
    });

    if (!asociado) {
      throw new NotFoundException('Asociado no encontrado');
    }

    return asociado;
  }

  // Crear un nuevo asociado
  async create(asociadoDto: AsociadoDto): Promise<Asociados> {
    const asociado = this.asociadosRepository.create(asociadoDto);  // Creamos el nuevo objeto asociado con el DTO
    try {
      return await this.asociadosRepository.save(asociado);  // Guardamos el objeto en la base de datos
    } catch (err: any) {
      if (err && err.code === '23505') {
        if (err.detail && err.detail.includes('numero_de_identificacion')) {
          throw new BadRequestException('Ya existe un asociado con esa identificación');
        }
      }
      throw err;
    }
  }

  // Actualizar un asociado
  async update(id: number, updateAsociadoDto: UpdateAsociadoDto): Promise<Asociados> {
    const asociado = await this.asociadosRepository.findOne({ where: { id } });
    if (!asociado) {
      throw new NotFoundException('Asociado no encontrado');
    }
    Object.assign(asociado, updateAsociadoDto);  // Asignamos los nuevos valores al objeto existente
    return this.asociadosRepository.save(asociado);  // Guardamos el asociado actualizado
  }

  // Eliminar un asociado por id
  async deleteOne(id: number): Promise<Asociados> {
    const asociado = await this.asociadosRepository.findOne({ where: { id } });
    if (!asociado) {
      throw new NotFoundException('Asociado no encontrado');
    }
    return this.asociadosRepository.remove(asociado);  // Eliminamos el asociado encontrado
  }
}
