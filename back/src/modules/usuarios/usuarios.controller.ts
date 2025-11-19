import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
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
  async findAll(@Query('includeLoans') includeLoans?: string): Promise<UsuarioResponseDto[]> {
    const usuarios = includeLoans === 'true' 
      ? await this.usuariosService.findAllWithLoans()
      : await this.usuariosService.findAll();
    
    return usuarios.map((usuario) => ({
      ...usuario,
      contrasena: null,
      roles: usuario.roles.map((role) => ({
        id: role.id,
        nombre: role.nombre,
      })),
      idAsociado: {
        id: usuario.id,
        nombres: [
          usuario.idAsociado.nombre1,
          usuario.idAsociado.nombre2,
          usuario.idAsociado.apellido1,
          usuario.idAsociado.apellido2,
        ].join(' '),
        numeroDeIdentificacion: usuario.idAsociado.numeroDeIdentificacion,
        idEstado: usuario.idAsociado.idEstado
      },
      activeLoansCount: usuario.activeLoansCount || 0,
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
