import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PresMetodosPago } from '../../entities/entities/PresMetodosPago';
import { MetodosPagoService } from './metodos-pago.service';
import { MetodosPagoController } from './metodos-pago.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PresMetodosPago])],
  providers: [MetodosPagoService],
  controllers: [MetodosPagoController],
  exports: [MetodosPagoService],
})
export class MetodosPagoModule {}