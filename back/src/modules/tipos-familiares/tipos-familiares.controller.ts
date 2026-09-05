import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { TiposFamiliaresService } from './tipos-familiares.service';
import { CreateTipoFamiliarDto } from './dto/create-tipo-familiar.dto';
import { UpdateTipoFamiliarDto } from './dto/update-tipo-familiar.dto';

@Controller('tipos-familiares')
export class TiposFamiliaresController {
  constructor(
    private readonly tiposFamiliaresService: TiposFamiliaresService,
  ) {}

  // Obtener todos los tipos de familiares
  @Get()
  findAll() {
    return this.tiposFamiliaresService.findAll();
  }

  // Obtener un tipo de familiar por id
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.tiposFamiliaresService.findOne(id);
  }

  // Crear un nuevo tipo de familiar
  @Post()
  create(@Body() createTipoFamiliarDto: CreateTipoFamiliarDto) {
    return this.tiposFamiliaresService.create(createTipoFamiliarDto);
  }

  // Actualizar un tipo de familiar por id
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateTipoFamiliarDto: UpdateTipoFamiliarDto,
  ) {
    return this.tiposFamiliaresService.update(id, updateTipoFamiliarDto);
  }

  // Eliminar un tipo de familiar por id
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.tiposFamiliaresService.remove(id);
  }
}