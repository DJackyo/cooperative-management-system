import { Module } from '@nestjs/common';
import { AsocAportesAsociadosService } from './aportes-asociados.service';
import { AsocAportesAsociadosController } from './aportes-asociados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsocAportesAsociados } from 'src/entities/entities/AsocAportesAsociados';
import { Asociados } from 'src/entities/entities/Asociados';

@Module({
  imports: [TypeOrmModule.forFeature([AsocAportesAsociados, Asociados])],
  controllers: [AsocAportesAsociadosController],
  providers: [AsocAportesAsociadosService],
})
export class AsocAportesAsociadosModule {}
