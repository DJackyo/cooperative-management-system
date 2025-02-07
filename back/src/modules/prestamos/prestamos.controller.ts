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
import { PrestamosService } from './prestamos.service';
import { PrestamoDto } from './dto/prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';
import { TasasService } from './services/tasas.service';

@Controller('prestamos')
export class PrestamosController {
  constructor(
    private readonly prestamosService: PrestamosService,
    private readonly tasasService: TasasService,
  ) {}

  // Ruta para obtener todos los prestamos
  @Get()
  async getAll() {
    const prestamos = await this.prestamosService.getAll();
    return prestamos.map((prestamo) => ({
      ...prestamo,
      tasa: prestamo.idTasa?.tasa,
    }));
  }

  // Ruta para obtener un prestamo por id
  @Get(':id')
  async getPrestamo(@Param('id') id: number) {
    return this.prestamosService.getOne(id); // Llamamos al servicio pasando el id
  }

  // Ruta para crear un nuevo prestamo
  @Post()
  async createPrestamo(@Body() prestamoDto: PrestamoDto) {
    return this.prestamosService.create(prestamoDto); // Llamamos al servicio pasando el DTO
  }

  // Ruta para actualizar un prestamo por id
  @Put(':id')
  async updatePrestamo(
    @Param('id') id: number,
    @Body() updatePrestamoDto: UpdatePrestamoDto,
  ) {
    return this.prestamosService.update(id, updatePrestamoDto); // Llamamos al servicio pasando el id y DTO
  }

  // Ruta para eliminar un prestamo por id
  @Delete(':id')
  async deletePrestamo(@Param('id') id: number) {
    return this.prestamosService.deleteOne(id); // Llamamos al servicio pasando el id
  }

  // Ruta para obtener un prestamo por id
  @Get('user/:userId')
  async getPrestamoByUserId(@Param('userId') id: number) {
    const prestamos = await this.prestamosService.getByUserId(id);
    return prestamos.map((prestamo) => ({
      ...prestamo,
      tasa: prestamo.idTasa?.tasa,
      idAsociado: {
        id: prestamo.idAsociado.id,
        nombres: [
          prestamo.idAsociado.nombre1,
          prestamo.idAsociado.nombre2,
          prestamo.idAsociado.apellido1,
          prestamo.idAsociado.apellido2,
        ].join(' '),
        numeroDeIdentificacion: prestamo.idAsociado.numeroDeIdentificacion,
        idEstado: prestamo.idAsociado.idEstado?.estado,
      },
    }));
  }

}
