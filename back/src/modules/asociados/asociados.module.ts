import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asociados } from '../../entities/entities/Asociados'; // Importa la entidad Asociados
import { AsocContactos } from '../../entities/entities/AsocContactos';
import { AsocUbicaciones } from '../../entities/entities/AsocUbicaciones';
import { AsocInformacionLaboral } from '../../entities/entities/AsocInformacionLaboral';
import { AsocEconomicaSocial } from '../../entities/entities/AsocEconomicaSocial';
import { AsocInformacionFamiliar } from '../../entities/entities/AsocInformacionFamiliar';
import { AsocAsistenciaAsamblea } from '../../entities/entities/AsocAsistenciaAsamblea';
import { AsociadosService } from './asociados.service'; // Importa el servicio
import { AsociadosController } from './asociados.controller'; // Importa el controlador

@Module({
  imports: [TypeOrmModule.forFeature([
    Asociados,
    AsocContactos,
    AsocUbicaciones,
    AsocInformacionLaboral,
    AsocEconomicaSocial,
    AsocInformacionFamiliar,
    AsocAsistenciaAsamblea,
  ])],
  providers: [AsociadosService], // Proveedor del servicio
  controllers: [AsociadosController], // Controlador del asociados
})
export class AsociadosModule { }
