import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuarios } from '../../entities/entities/Usuarios';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuarios)
    private usuariosRepository: Repository<Usuarios>,
  ) { }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuarios> {
    const usuario = this.usuariosRepository.create(createUsuarioDto);
    return this.usuariosRepository.save(usuario);
  }

  async findAll(): Promise<Usuarios[]> {
    return this.usuariosRepository.find({
      relations: [ 'roles', 'idAsociado', 'idAsociado.idEstado']
    });
  }

  async findAllWithLoans(): Promise<any[]> {
    return this.usuariosRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.roles', 'roles')
      .leftJoinAndSelect('usuario.idAsociado', 'asociado')
      .leftJoinAndSelect('asociado.idEstado', 'estado')
      .leftJoin('prestamos', 'prestamo', 'prestamo.id_asociado = asociado.id AND prestamo.estado IN (:...estados)', {
        estados: ['APROBADO', 'ACTIVO']
      })
      .addSelect('COUNT(prestamo.id)', 'activeLoansCount')
      .groupBy('usuario.id')
      .addGroupBy('roles.id')
      .addGroupBy('asociado.id')
      .addGroupBy('estado.id')
      .getRawAndEntities()
      .then(result => {
        return result.entities.map((entity, index) => ({
          ...entity,
          activeLoansCount: parseInt(result.raw[index].activeLoansCount) || 0
        }));
      });
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
