import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuarios } from '../../entities/entities/Usuarios';
import { UsuarioResponseDto } from './dto/usuario-response.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto): Promise<Usuarios> {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  async findAll(): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.usuariosService.findAll();
    return usuarios.map((usuario) => ({
      ...usuario,
      contrasena: null,
      roles: usuario.roles.map((role) => ({
        id: role.id,
        nombre: role.nombre,
      })),
      idAsociado: {
        nombres: [
          usuario.idAsociado.nombre1,
          usuario.idAsociado.nombre2,
          usuario.idAsociado.apellido1,
          usuario.idAsociado.apellido2,
        ].join(' '),
        numeroDeIdentificacion: usuario.idAsociado.numeroDeIdentificacion,
        idEstado: usuario.idAsociado.idEstado
      },
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Usuarios> {
    const usuario = await this.usuariosService.findOne(id);
    return {
      ...usuario,
      contrasena: null,
    };
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuarios> {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.usuariosService.remove(id);
  }
}
