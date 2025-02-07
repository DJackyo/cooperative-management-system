import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';

import { TasasService } from './tasas.service';

@Controller('tasas')
export class TasasController {
  constructor(private readonly tasasService: TasasService) {}

  // Endpoint para obtener la tasa de un año específico
  @Get(':anio')
  async getTasa(@Param('anio') anio: number) {
    const tasa = await this.tasasService.getTasaPorAnio(anio);
    if (!tasa) {
      return { message: `No se encontró tasa para el año ${anio}` };
    }
    return { tasa: tasa.tasa };
  }

  // Endpoint para obtener todas las tasas
  @Get('')
  async getTasas() {
    return await this.tasasService.getTodasLasTasas();
  }
}
