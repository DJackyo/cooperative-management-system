import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { EstadosAsociadoService } from './estados-asociado.service';
import { CreateEstadoAsociadoDto } from './dto/create-estado-asociado.dto';
import { UpdateEstadoAsociadoDto } from './dto/update-estado-asociado.dto';

@Controller('estados-asociado')
export class EstadosAsociadoController {
  constructor(
    private readonly estadosAsociadoService: EstadosAsociadoService,
  ) {}

  // Obtener todos los estados de asociado
  @Get()
  findAll() {
    return this.estadosAsociadoService.findAll();
  }

  // Obtener un estado de asociado por id
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.estadosAsociadoService.findOne(id);
  }

  // Crear un nuevo estado de asociado
  @Post()
  create(@Body() createEstadoAsociadoDto: CreateEstadoAsociadoDto) {
    return this.estadosAsociadoService.create(createEstadoAsociadoDto);
  }

  // Actualizar un estado de asociado por id
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateEstadoAsociadoDto: UpdateEstadoAsociadoDto,
  ) {
    return this.estadosAsociadoService.update(id, updateEstadoAsociadoDto);
  }

  // Eliminar un estado de asociado por id
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.estadosAsociadoService.remove(id);
  }
}