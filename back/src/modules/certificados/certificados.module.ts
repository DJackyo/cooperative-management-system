import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';
import { Asociados } from 'src/entities/entities/Asociados';
import { AsocAportesAsociados } from 'src/entities/entities/AsocAportesAsociados';
import { Prestamos } from 'src/entities/entities/Prestamos';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asociados, AsocAportesAsociados, Prestamos]),
  ],
  controllers: [CertificadosController],
  providers: [CertificadosService],
})
export class CertificadosModule {}