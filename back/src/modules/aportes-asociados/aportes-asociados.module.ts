import { Module } from '@nestjs/common';
import { AportesAsociadosService } from './aportes-asociados.service';
import { AportesAsociadosController } from './aportes-asociados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AportesAsociados } from 'src/entities/entities/AportesAsociados';
import { Asociados } from 'src/entities/entities/Asociados';

@Module({
  imports: [TypeOrmModule.forFeature([AportesAsociados, Asociados])],
  controllers: [AportesAsociadosController],
  providers: [AportesAsociadosService],
})
export class AportesAsociadosModule {}
