import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asociados } from '../../entities/entities/Asociados';
import { AsocAportesAsociados } from '../../entities/entities/AsocAportesAsociados';
import { Prestamos } from '../../entities/entities/Prestamos';
import { RetirosAsociados } from '../../entities/entities/RetirosAsociados';
import { RetirosAsociadosController } from './retiros-asociados.controller';
import { RetirosAsociadosService } from './retiros-asociados.service';

@Module({
  imports: [TypeOrmModule.forFeature([RetirosAsociados, Asociados, AsocAportesAsociados, Prestamos])],
  controllers: [RetirosAsociadosController],
  providers: [RetirosAsociadosService],
})
export class RetirosAsociadosModule {}