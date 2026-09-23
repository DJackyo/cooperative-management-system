import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asociados } from 'src/entities/entities/Asociados';
import { AsocAportesAsociados } from 'src/entities/entities/AsocAportesAsociados';
import { Prestamos } from 'src/entities/entities/Prestamos';
import { RecibosMensualesController } from './recibos-mensuales.controller';
import { RecibosMensualesService } from './recibos-mensuales.service';

@Module({
  imports: [TypeOrmModule.forFeature([Asociados, AsocAportesAsociados, Prestamos])],
  controllers: [RecibosMensualesController],
  providers: [RecibosMensualesService],
})
export class RecibosMensualesModule {}
