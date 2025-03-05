import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrestamosService } from './prestamos.service';
import { PrestamosController } from './prestamos.controller';
import { Prestamos } from 'src/entities/entities/Prestamos';
import { TasasService } from './services/tasas.service';
import { PresTasasPrestamo } from 'src/entities/entities/PresTasasPrestamo';
import { TasasController } from './services/tasas.controller';
import { EstadosAprobacion } from 'src/entities/entities/EstadosAprobacion';
import { PresAprobacionPrestamos } from 'src/entities/entities/PresAprobacionPrestamos';
import { PresCuotas } from 'src/entities/entities/PresCuotas';
import { AuthModule } from 'src/auth/auth.module';
import { Asociados } from 'src/entities/entities/Asociados';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Prestamos,
      PresTasasPrestamo,
      PresAprobacionPrestamos,
      PresCuotas,
      EstadosAprobacion,
      Asociados,
    ]),
    AuthModule,
  ],
  controllers: [PrestamosController, TasasController],
  providers: [PrestamosService, TasasService],
})
export class PrestamosModule {}
