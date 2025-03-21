import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { PresPagos } from 'src/entities/entities/PresPagos';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PresCuotas } from 'src/entities/entities/PresCuotas';
import { Prestamos } from 'src/entities/entities/Prestamos';
import { PresMetodosPago } from 'src/entities/entities/PresMetodosPago';

@Module({
  controllers: [PagosController],
  providers: [PagosService],
  imports: [
    TypeOrmModule.forFeature([
      Prestamos,
      PresCuotas,
      PresPagos,
      PresMetodosPago,
    ]),
    AuthModule,
  ],
})
export class PagosModule {}
