import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../../entities/entities/Roles';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
  ) {}

  // Obtener todos los roles
  async findAll(): Promise<Roles[]> {
    return this.rolesRepository.find();
  }

  // Obtener un rol por id
  async findOne(id: number): Promise<Roles> {
    const rol = await this.rolesRepository.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }
    return rol;
  }

  // Crear un nuevo rol
  async create(createRoleDto: CreateRoleDto): Promise<Roles> {
    const rol = this.rolesRepository.create(createRoleDto);
    try {
      return await this.rolesRepository.save(rol);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException('Ya existe un rol con ese nombre');
      }
      throw err;
    }
  }

  // Actualizar un rol
  async update(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Roles> {
    const rol = await this.findOne(id);
    Object.assign(rol, updateRoleDto);
    try {
      return await this.rolesRepository.save(rol);
    } catch (err: any) {
      if (err && err.code === '23505') {
        throw new BadRequestException('Ya existe un rol con ese nombre');
      }
      throw err;
    }
  }

  // Eliminar un rol
  async remove(id: number): Promise<void> {
    const rol = await this.findOne(id);
    await this.rolesRepository.remove(rol);
  }
}