import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { EstadosAprobacionService } from './estados-aprobacion.service';
import { CreateEstadoAprobacionDto } from './dto/create-estado-aprobacion.dto';
import { UpdateEstadoAprobacionDto } from './dto/update-estado-aprobacion.dto';

@Controller('estados-aprobacion')
export class EstadosAprobacionController {
  constructor(
    private readonly estadosAprobacionService: EstadosAprobacionService,
  ) {}

  // Obtener todos los estados de aprobación
  @Get()
  findAll() {
    return this.estadosAprobacionService.findAll();
  }

  // Obtener un estado de aprobación por id
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.estadosAprobacionService.findOne(id);
  }

  // Crear un nuevo estado de aprobación
  @Post()
  create(@Body() createEstadoAprobacionDto: CreateEstadoAprobacionDto) {
    return this.estadosAprobacionService.create(createEstadoAprobacionDto);
  }

  // Actualizar un estado de aprobación por id
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateEstadoAprobacionDto: UpdateEstadoAprobacionDto,
  ) {
    return this.estadosAprobacionService.update(
      id,
      updateEstadoAprobacionDto,
    );
  }

  // Eliminar un estado de aprobación por id
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.estadosAprobacionService.remove(id);
  }
}