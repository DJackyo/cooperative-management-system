import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrestamosService } from './prestamos.service';
import { PrestamosController } from './prestamos.controller';
import { Prestamos } from 'src/entities/entities/Prestamos';
import { TasasService } from './services/tasas.service';
import { PresTasasPrestamo } from 'src/entities/entities/PresTasasPrestamo';
import { TasasController } from './services/tasas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Prestamos, PresTasasPrestamo])],
  controllers: [PrestamosController, TasasController],
  providers: [PrestamosService, TasasService],
})
export class PrestamosModule {}
