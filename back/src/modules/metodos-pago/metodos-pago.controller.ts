import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { MetodosPagoService } from './metodos-pago.service';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo-pago.dto';

@Controller('metodos-pago')
export class MetodosPagoController {
  constructor(private readonly metodosPagoService: MetodosPagoService) {}

  // Obtener todos los métodos de pago
  @Get()
  findAll() {
    return this.metodosPagoService.findAll();
  }

  // Obtener un método de pago por id
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.metodosPagoService.findOne(id);
  }

  // Crear un nuevo método de pago
  @Post()
  create(@Body() createMetodoPagoDto: CreateMetodoPagoDto) {
    return this.metodosPagoService.create(createMetodoPagoDto);
  }

  // Actualizar un método de pago por id
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateMetodoPagoDto: UpdateMetodoPagoDto,
  ) {
    return this.metodosPagoService.update(id, updateMetodoPagoDto);
  }

  // Eliminar un método de pago por id
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.metodosPagoService.remove(id);
  }
}