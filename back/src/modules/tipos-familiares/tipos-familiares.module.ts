import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsocTiposFamiliares } from '../../entities/entities/AsocTiposFamiliares';
import { TiposFamiliaresService } from './tipos-familiares.service';
import { TiposFamiliaresController } from './tipos-familiares.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AsocTiposFamiliares])],
  providers: [TiposFamiliaresService],
  controllers: [TiposFamiliaresController],
  exports: [TiposFamiliaresService],
})
export class TiposFamiliaresModule {}