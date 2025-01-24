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
import { AportesAsociadosService } from './aportes-asociados.service';
import { CreateAportesAsociadosDto } from './dto/create-aportes-asociado.dto';
import { UpdateAportesAsociadosDto } from './dto/update-aportes-asociado.dto';
import { AportesAsociados } from '../../entities/entities/aportesAsociados';

@Controller('aportes-asociados')
export class AportesAsociadosController {
  constructor(
    private readonly aportesAsociadosService: AportesAsociadosService,
  ) {}

  // Crear un nuevo aporte
  @Post()
  create(
    @Body() createAportesAsociadosDto: CreateAportesAsociadosDto,
  ): Promise<AportesAsociados> {
    return this.aportesAsociadosService.create(createAportesAsociadosDto);
  }

  // Obtener todos los aportes
  @Get()
  findAll(): Promise<AportesAsociados[]> {
    return this.aportesAsociadosService.findAll();
  }

  // Obtener un aporte por su ID
  @Get(':id')
  findOne(@Param('id') id: number): Promise<AportesAsociados> {
    return this.aportesAsociadosService.findOne(id);
  }

  // Actualizar un aporte
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateAportesAsociadosDto: UpdateAportesAsociadosDto,
  ): Promise<AportesAsociados> {
    return this.aportesAsociadosService.update(id, updateAportesAsociadosDto);
  }

  // Eliminar un aporte
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.aportesAsociadosService.remove(id);
  }

  @Post('findWithFilters')
  async findWithFilters(@Body() filter: { idAsociadoId?: number }) {
    return this.aportesAsociadosService.findWithFilters(filter);
  }
}
