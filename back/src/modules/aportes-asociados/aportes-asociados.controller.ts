import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { AsocAportesAsociadosService } from './aportes-asociados.service';
import { CreateAsocAportesAsociadosDto } from './dto/create-aportes-asociado.dto';
import { UpdateAsocAportesAsociadosDto } from './dto/update-aportes-asociado.dto';
import { AsocAportesAsociados } from '../../entities/entities/AsocAportesAsociados';

@Controller('aportes-asociados')
export class AsocAportesAsociadosController {
  constructor(
    private readonly AsocAportesAsociadosService: AsocAportesAsociadosService,
  ) {}

  // Crear un nuevo aporte
  @Post()
  create(
    @Body() createAsocAportesAsociadosDto: CreateAsocAportesAsociadosDto,
  ): Promise<AsocAportesAsociados> {
    return this.AsocAportesAsociadosService.create(createAsocAportesAsociadosDto);
  }

  // Obtener todos los aportes
  @Get()
  findAll(): Promise<AsocAportesAsociados[]> {
    return this.AsocAportesAsociadosService.findAll();
  }

  // Obtener un aporte por su ID
  @Get(':id')
  findOne(@Param('id') id: number): Promise<AsocAportesAsociados> {
    return this.AsocAportesAsociadosService.findOne(id);
  }

  // Actualizar un aporte
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateAsocAportesAsociadosDto: UpdateAsocAportesAsociadosDto,
  ): Promise<AsocAportesAsociados> {
    return this.AsocAportesAsociadosService.update(id, updateAsocAportesAsociadosDto);
  }

  // Eliminar un aporte
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.AsocAportesAsociadosService.remove(id);
  }

  @Post('findWithFilters')
  async findWithFilters(@Body() filter: { idAsociadoId?: number }) {
    return this.AsocAportesAsociadosService.findWithFilters(filter);
  }
}
