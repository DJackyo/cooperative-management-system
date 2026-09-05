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
import { CreateTasaDto } from '../dto/create-tasa.dto';
import { UpdateTasaDto } from '../dto/update-tasa.dto';

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

  // Endpoint para obtener una tasa por id
  @Get('find/:id')
  async findOne(@Param('id') id: number) {
    return await this.tasasService.findOne(id);
  }

  // Endpoint para crear una nueva tasa
  @Post()
  async create(@Body() createTasaDto: CreateTasaDto) {
    return await this.tasasService.create(createTasaDto);
  }

  // Endpoint para actualizar una tasa por id
  @Put('find/:id')
  async update(
    @Param('id') id: number,
    @Body() updateTasaDto: UpdateTasaDto,
  ) {
    return await this.tasasService.update(id, updateTasaDto);
  }

  // Endpoint para eliminar una tasa por id
  @Delete('find/:id')
  async remove(@Param('id') id: number) {
    await this.tasasService.remove(id);
    return { message: 'Tasa eliminada correctamente' };
  }
}
