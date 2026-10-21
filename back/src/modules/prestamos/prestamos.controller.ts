import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PrestamosService } from './prestamos.service';
import { PrestamoDto } from './dto/prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';
import { RetanqueoDto } from './dto/retanqueo.dto';
import { TasasService } from './services/tasas.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  DatosReciboRetanqueo,
  generarReciboRetanqueoPDF,
} from './retanqueo-pdf.util';

@Controller('prestamos')
export class PrestamosController {
  constructor(
    private readonly prestamosService: PrestamosService,
    private readonly tasasService: TasasService,
  ) {}

  /* Ruta para obtener el listado de trazas de retanqueo */
  @UseGuards(JwtAuthGuard)
  @Get('retanqueos')
  async getRetanqueos(@Query('idAsociado') idAsociado?: string) {
    return this.prestamosService.getRetanqueos(
      idAsociado ? Number(idAsociado) : undefined,
    );
  }

  /* Ruta para obtener una traza de retanqueo por id */
  @UseGuards(JwtAuthGuard)
  @Get('retanqueos/:id')
  async getRetanqueo(@Param('id') id: number) {
    return this.prestamosService.getRetanqueoById(id);
  }

  /* Ruta para obtener los retanqueos asociados a un crédito */
  @UseGuards(JwtAuthGuard)
  @Get('retanqueos-credito/:idPrestamo')
  async getRetanqueosDePrestamo(@Param('idPrestamo') idPrestamo: number) {
    return this.prestamosService.getRetanqueosDePrestamo(idPrestamo);
  }

  /* Ruta para descargar el recibo PDF del retanqueo */
  @UseGuards(JwtAuthGuard)
  @Get('retanqueos/:id/recibo-pdf')
  async descargarReciboRetanqueo(
    @Param('id') id: number,
    @Res() res: Response,
  ) {
    const datos: DatosReciboRetanqueo =
      await this.prestamosService.getDatosReciboRetanqueo(id);
    const pdf = await generarReciboRetanqueoPDF(datos);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recibo-retanqueo-${datos.numeroRecibo || id}.pdf"`,
      'Content-Length': pdf.length.toString(),
    });
    res.end(pdf);
  }

  /* Ruta para obtener todos los prestamos*/
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    const prestamos = await this.prestamosService.getAll();
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
        idEstado: prestamo.idAsociado.idEstado,
      },
    }));
  }

  /* Ruta para obtener un prestamo por id de usuario*/
  @UseGuards(JwtAuthGuard)
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

  /* Ruta para obtener un prestamo por id*/
  @Get(':id')
  async getPrestamo(@Param('id') id: number) {
    return this.prestamosService.getOne(id); // Llamamos al servicio pasando el id
  }

  /* Ruta para crear un nuevo prestamo*/
  @UseGuards(JwtAuthGuard)
  @Post()
  async createPrestamo(@Body() prestamoDto: PrestamoDto) {
    return this.prestamosService.create(prestamoDto); // Llamamos al servicio pasando el DTO
  }

  /* Ruta para actualizar un prestamo por id*/
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updatePrestamo(
    @Param('id') id: number,
    @Body() updatePrestamoDto: UpdatePrestamoDto,
  ) {
    return this.prestamosService.update(id, updatePrestamoDto); // Llamamos al servicio pasando el id y DTO
  }

  /* Ruta para eliminar un prestamo por id*/
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePrestamo(@Param('id') id: number) {
    return this.prestamosService.deleteOne(id); // Llamamos al servicio pasando el id
  }

  @UseGuards(JwtAuthGuard)
  @Patch('approve/:id')
  async updatePrestamoStatus(
    @Param('id') id: number,
    @Body() updatePrestamoDto: UpdatePrestamoDto,
    @Request() req,
  ) {
    const usuarioRevisor = req.user;
    // console.log('updatePrestamoStatus', usuarioRevisor)
    return this.prestamosService.updateStatus(
      id,
      updatePrestamoDto,
      usuarioRevisor,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/recalcular')
  async recalcularCuotas(@Param('id') id: number) {
    return this.prestamosService.recalcularCuotas(id);
  }

  @Post('findWithFilters')
  async findWithFilters(
    @Body() filter: { userId?: number; creditId?: number },
  ) {
    return this.prestamosService.findWithFilters(filter);
  }

  /* Ruta para obtener créditos elegibles para retanqueo de un asociado */
  @UseGuards(JwtAuthGuard)
  @Get('retancuables/:userId')
  async getCreditosRetanqueables(@Param('userId') userId: number) {
    return this.prestamosService.getCreditosRetanqueables(userId);
  }

  /* Ruta para procesar un retanqueo de crédito */
  @UseGuards(JwtAuthGuard)
  @Post('retanqueo')
  async procesarRetanqueo(
    @Body() dto: RetanqueoDto,
    @Request() req,
  ) {
    const usuario = req.user;
    return this.prestamosService.procesarRetanqueo(dto, usuario);
  }
}
