import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuarios } from '../../entities/entities/Usuarios';
import { Prestamos } from '../../entities/entities/Prestamos';
import { Asociados } from '../../entities/entities/Asociados';

@Module({
  imports: [TypeOrmModule.forFeature([Usuarios, Prestamos, Asociados])],
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService],
})
export class UsuariosModule {}
