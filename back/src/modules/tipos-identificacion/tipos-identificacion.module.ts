import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposIdentificacion } from '../../entities/entities/TiposIdentificacion';
import { TiposIdentificacionService } from './tipos-identificacion.service';
import { TiposIdentificacionController } from './tipos-identificacion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TiposIdentificacion])],
  providers: [TiposIdentificacionService],
  controllers: [TiposIdentificacionController],
  exports: [TiposIdentificacionService],
})
export class TiposIdentificacionModule {}