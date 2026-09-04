import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuarios } from '../../entities/entities/Usuarios';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Prestamos } from '../../entities/entities/Prestamos';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuarios)
    private usuariosRepository: Repository<Usuarios>,
    @InjectRepository(Prestamos)
    private prestamosRepository: Repository<Prestamos>,
  ) { }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuarios> {
    const usuario = this.usuariosRepository.create(createUsuarioDto);
    try {
      return await this.usuariosRepository.save(usuario);
    } catch (err: any) {
      // handle unique constraint errors
      if (err && err.code === '23505') {
        if (err.detail && err.detail.includes('correo_electronico')) {
          throw new BadRequestException('Ya existe un usuario con ese correo electrónico');
        }
        // other unique keys can be added here
      }
      throw err;
    }
  }

  async findAll(): Promise<Usuarios[]> {
    return this.usuariosRepository.find({
      relations: [ 'roles', 'idAsociado', 'idAsociado.idEstado']
    });
  }

  async findAllWithLoans(): Promise<any[]> {
    const [usuarios, conteos] = await Promise.all([
      this.findAll(),
      this.prestamosRepository
        .createQueryBuilder('prestamo')
        .select('prestamo.id_asociado', 'asociadoId')
        .addSelect('COUNT(prestamo.id)', 'loansCount')
        .groupBy('prestamo.id_asociado')
        .getRawMany(),
    ]);

    const conteosPorAsociado = new Map(
      conteos.map((item) => [Number(item.asociadoId), Number(item.loansCount)]),
    );

    return usuarios.map((usuario) => ({
      ...usuario,
      loansCount: conteosPorAsociado.get(usuario.idAsociado?.id) || 0,
    }));
  }

  async findOne(id: number): Promise<Usuarios> {
    return this.usuariosRepository.findOne({
      where: { id },
      relations: [ 'roles', 'idAsociado', 'idAsociado.idEstado']
    });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuarios> {
    await this.usuariosRepository.update(id, updateUsuarioDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usuariosRepository.delete(id);
  }
}
