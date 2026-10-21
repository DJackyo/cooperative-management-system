import { Module } from '@nestjs/common';
import { AsocAportesAsociadosService } from './aportes-asociados.service';
import { AsocAportesAsociadosController } from './aportes-asociados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { AsocAportesAsociados } from 'src/entities/entities/AsocAportesAsociados';
import { Asociados } from 'src/entities/entities/Asociados';
import { AportesDepuracionService } from './aportes-depuracion.service';
import { AportesDepuracionGuard } from './aportes-depuracion.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([AsocAportesAsociados, Asociados]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [AsocAportesAsociadosController],
  providers: [AsocAportesAsociadosService, AportesDepuracionService, AportesDepuracionGuard],
})
export class AsocAportesAsociadosModule {}
