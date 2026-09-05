import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadosAsociado } from '../../entities/entities/EstadosAsociado';
import { EstadosAsociadoService } from './estados-asociado.service';
import { EstadosAsociadoController } from './estados-asociado.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EstadosAsociado])],
  providers: [EstadosAsociadoService],
  controllers: [EstadosAsociadoController],
  exports: [EstadosAsociadoService],
})
export class EstadosAsociadoModule {}