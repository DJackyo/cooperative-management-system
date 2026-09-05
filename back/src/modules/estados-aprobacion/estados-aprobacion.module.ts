import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadosAprobacion } from '../../entities/entities/EstadosAprobacion';
import { EstadosAprobacionService } from './estados-aprobacion.service';
import { EstadosAprobacionController } from './estados-aprobacion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EstadosAprobacion])],
  providers: [EstadosAprobacionService],
  controllers: [EstadosAprobacionController],
  exports: [EstadosAprobacionService],
})
export class EstadosAprobacionModule {}