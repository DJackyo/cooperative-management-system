import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { TiposIdentificacionService } from './tipos-identificacion.service';
import { CreateTipoIdentificacionDto } from './dto/create-tipo-identificacion.dto';
import { UpdateTipoIdentificacionDto } from './dto/update-tipo-identificacion.dto';

@Controller('tipos-identificacion')
export class TiposIdentificacionController {
  constructor(
    private readonly tiposIdentificacionService: TiposIdentificacionService,
  ) {}

  // Obtener todos los tipos de identificación
  @Get()
  findAll() {
    return this.tiposIdentificacionService.findAll();
  }

  // Obtener un tipo de identificación por id
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.tiposIdentificacionService.findOne(id);
  }

  // Crear un nuevo tipo de identificación
  @Post()
  create(@Body() createTipoIdentificacionDto: CreateTipoIdentificacionDto) {
    return this.tiposIdentificacionService.create(createTipoIdentificacionDto);
  }

  // Actualizar un tipo de identificación por id
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateTipoIdentificacionDto: UpdateTipoIdentificacionDto,
  ) {
    return this.tiposIdentificacionService.update(
      id,
      updateTipoIdentificacionDto,
    );
  }

  // Eliminar un tipo de identificación por id
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.tiposIdentificacionService.remove(id);
  }
}