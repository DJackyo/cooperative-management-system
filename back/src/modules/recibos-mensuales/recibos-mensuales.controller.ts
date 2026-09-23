import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConsultaReciboMensual, RecibosMensualesService } from './recibos-mensuales.service';
import { generarReciboMensualPDF } from './recibos-mensuales-pdf.util';

@Controller('recibos-mensuales')
export class RecibosMensualesController {
  constructor(private readonly recibosMensualesService: RecibosMensualesService) {}

  @Get(':idAsociado/datos')
  async obtenerDatos(
    @Param('idAsociado', ParseIntPipe) idAsociado: number,
    @Query('mes') mes: string,
    @Query('anio') anio: string,
  ) {
    const consulta: ConsultaReciboMensual = {
      idAsociado,
      mes: Number(mes),
      anio: Number(anio),
    };
    return this.recibosMensualesService.obtenerRecibo(consulta);
  }

  @Get(':idAsociado')
  async generarPDF(
    @Param('idAsociado', ParseIntPipe) idAsociado: number,
    @Query('mes') mes: string,
    @Query('anio') anio: string,
    @Res() res: Response,
  ) {
    const consulta: ConsultaReciboMensual = {
      idAsociado,
      mes: Number(mes),
      anio: Number(anio),
    };
    const data = await this.recibosMensualesService.obtenerRecibo(consulta);
    const pdf = await generarReciboMensualPDF(data);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="recibo-mensual-${idAsociado}-${anio}-${mes}.pdf"`,
      'Content-Length': pdf.length.toString(),
    });
    res.end(pdf);
  }
}
