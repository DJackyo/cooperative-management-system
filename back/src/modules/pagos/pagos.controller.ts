import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  create(@Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.create(createPagoDto);
  }

  @Get()
  findAll() {
    return this.pagosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePagoDto: UpdatePagoDto) {
    return this.pagosService.update(+id, updatePagoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosService.remove(+id);
  }

  @Post('createByCredit/:id')
  async createByCredit(
    @Param('id') id: number,
    @Body() createPagoDto: CreatePagoDto,
  ) {
    try {
      const result = await this.pagosService.createByCredit(id, createPagoDto);
      return {
        status: 'success',
        data: result,
        message: 'Pago registrado exitosamente'
      };
    } catch (error) {
      console.error('Error en createByCredit:', error);
      return {
        status: 'error',
        data: null,
        message: error.message || 'Error al registrar el pago'
      };
    }
  }

  @Get('debug/cuota/:id')
  debugCuota(@Param('id') id: string) {
    return this.pagosService.debugCuota(+id);
  }

  @Post('debug/update-cuota/:id')
  async updateCuotaStatus(@Param('id') id: string) {
    return this.pagosService.updateCuotaStatus(+id);
  }
}
