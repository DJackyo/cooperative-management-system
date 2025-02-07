import { Injectable, NotFoundException } from '@nestjs/common';
import { PrestamoDto } from './dto/prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Prestamos } from 'src/entities/entities/Prestamos';
import { Repository } from 'typeorm';

@Injectable()
export class PrestamosService {
  constructor(
    @InjectRepository(Prestamos)
    private readonly prestamosRepository: Repository<Prestamos>, // El repositorio de la entidad Prestamos
  ) {}
  // Obtener todos los prestamos, incluyendo las relaciones
  async getAll(): Promise<Prestamos[]> {
    return this.prestamosRepository.find({
      relations: ['idTasa'], // Cargamos las relaciones
    });
  }

  // Obtener un prestamo por id, incluyendo las relaciones
  async getOne(id: number): Promise<Prestamos> {
    const prestamo = await this.prestamosRepository.findOne({
      where: { id },
      relations: ['idTasa'], // Cargamos las relaciones
    });

    if (!prestamo) {
      throw new NotFoundException('Prestamo no encontrado');
    }

    return prestamo;
  }

  // Crear un nuevo prestamo
  async create(prestamoDto: PrestamoDto): Promise<Prestamos> {
    const prestamo = this.prestamosRepository.create(prestamoDto); // Creamos el nuevo objeto prestamo con el DTO
    return this.prestamosRepository.save(prestamo); // Guardamos el objeto en la base de datos
  }

  // Actualizar un prestamo
  async update(
    id: number,
    updatePrestamoDto: UpdatePrestamoDto,
  ): Promise<Prestamos> {
    const prestamo = await this.prestamosRepository.findOne({ where: { id } });
    if (!prestamo) {
      throw new NotFoundException('Prestamo no encontrado');
    }
    Object.assign(prestamo, updatePrestamoDto); // Asignamos los nuevos valores al objeto existente
    return this.prestamosRepository.save(prestamo); // Guardamos el prestamo actualizado
  }

  // Eliminar un prestamo por id
  async deleteOne(id: number): Promise<Prestamos> {
    const prestamo = await this.prestamosRepository.findOne({ where: { id } });
    if (!prestamo) {
      throw new NotFoundException('Prestamo no encontrado');
    }
    return this.prestamosRepository.remove(prestamo); // Eliminamos el prestamo encontrado
  }

  // Obtener los prestamos por id de usuario, incluyendo las relaciones
  async getByUserId(id: number): Promise<Prestamos[]> {
    // Encontramos todos los préstamos que pertenecen al usuario con idAsociado
    const prestamos = await this.prestamosRepository.find({
      where: {
        idAsociado: { id }, // Referencia explícita al campo `id` dentro de la entidad `Asociados`
      },
      relations: [
        'idTasa',
        'idAsociado',
        // 'presCancelaciones',
        // 'presCuotas',
        // 'presPagos',
        // 'aprobacionPrestamos',
        // 'presHistorialPrestamos',
      ],
    });

    // Si no se encontraron préstamos, lanzamos una excepción
    if (!prestamos || prestamos.length === 0) {
      throw new NotFoundException(
        'No se encontraron préstamos para este usuario',
      );
    }

    return prestamos;
  }
}
