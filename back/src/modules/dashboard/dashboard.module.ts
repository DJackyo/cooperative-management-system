import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Asociados } from '../../entities/entities/Asociados';
import { Prestamos } from '../../entities/entities/Prestamos';
import { PresPagos } from '../../entities/entities/PresPagos';
import { AsocAportesAsociados } from '../../entities/entities/AsocAportesAsociados';
import { PresCuotas } from '../../entities/entities/PresCuotas';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asociados,
      Prestamos,
      PresPagos,
      PresCuotas,
      AsocAportesAsociados,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}