import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  CertificadosService,
  ConsultaEstadoCuenta,
} from './certificados.service';
import { generarCertificadoPDF } from './certificados-pdf.util';

@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  /** Datos del estado de cuenta (para vista previa en la interfaz) */
  @Get('estado-cuenta/:idAsociado/datos')
  async getDatos(
    @Param('idAsociado') idAsociado: string,
    @Query('tipo') tipo: string | undefined,
    @Query('desde') desde: string | undefined,
    @Query('hasta') hasta: string | undefined,
  ) {
    const tipoNorm = CertificadosService.normalizarTipo(tipo);
    CertificadosService.validarRangos(desde, hasta);
    const consulta: ConsultaEstadoCuenta = {
      idAsociado: parseInt(idAsociado, 10),
      tipo: tipoNorm,
      desde,
      hasta,
    };
    const data = await this.certificadosService.obtenerEstadoCuenta(consulta);
    return {
      status: 'success',
      data,
    };
  }

  /** Genera y devuelve el certificado en PDF */
  @Get('estado-cuenta/:idAsociado')
  async generar(
    @Param('idAsociado') idAsociado: string,
    @Query('tipo') tipo: string | undefined,
    @Query('desde') desde: string | undefined,
    @Query('hasta') hasta: string | undefined,
    @Res() res: Response,
  ) {
    const id = parseInt(idAsociado, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'El id del asociado es inválido.',
      });
    }

    const tipoNorm = CertificadosService.normalizarTipo(tipo);
    CertificadosService.validarRangos(desde, hasta);

    const consulta: ConsultaEstadoCuenta = {
      idAsociado: id,
      tipo: tipoNorm,
      desde,
      hasta,
    };

    const data = await this.certificadosService.obtenerEstadoCuenta(consulta);

    const pdfBuffer = await generarCertificadoPDF(data);

    const fecha = new Date().toISOString().slice(0, 10);
    const filename = `certificado-estado-cuenta-${tipoNorm}-${id}-${fecha}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}