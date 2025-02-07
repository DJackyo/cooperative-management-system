import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrestamosService } from './prestamos.service';
import { PrestamosController } from './prestamos.controller';
import { Prestamos } from 'src/entities/entities/Prestamos';

@Module({
  imports: [TypeOrmModule.forFeature([Prestamos])],
  controllers: [PrestamosController],
  providers: [PrestamosService],
})
export class PrestamosModule {}
