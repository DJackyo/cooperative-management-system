import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuarios } from '../../entities/entities/Usuarios';
import { Prestamos } from '../../entities/entities/Prestamos';

@Module({
  imports: [TypeOrmModule.forFeature([Usuarios, Prestamos])],
  providers: [UsuariosService],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
