import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asociados } from '../../entities/entities/Asociados'; // Importa la entidad Asociados
import { AsociadosService } from './asociados.service'; // Importa el servicio
import { AsociadosController } from './asociados.controller'; // Importa el controlador

@Module({
  imports: [TypeOrmModule.forFeature([Asociados])], // Asegúrate de registrar la entidad Asociados aquí
  providers: [AsociadosService], // Proveedor del servicio
  controllers: [AsociadosController], // Controlador del asociados
})
export class AsociadosModule { }
