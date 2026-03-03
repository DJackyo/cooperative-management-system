import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

const PATH_PAGOS = join(process.cwd(), 'uploads', 'comprobantes', 'pagos');

function extractYearMonth(dateStr?: string) {
  try {
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return { year: dateStr.slice(0, 4), month: dateStr.slice(5, 7) };
    }
    const d = dateStr ? new Date(dateStr) : new Date();
    const year = String(d.getFullYear());
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return { year, month };
  } catch {
    const d = new Date();
    return { year: String(d.getFullYear()), month: String(d.getMonth() + 1).padStart(2, '0') };
  }
}

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
  @UseInterceptors(
    FileInterceptor('comprobante', {
      storage: diskStorage({
        destination: (req: any, file: Express.Multer.File, callback) => {
          try {
            const loanId = String(req.params?.id || req.body?.idPrestamo || 'unknown');
            // Save to a stable temporary folder; we'll move after upload.
            const uploadPath = join(PATH_PAGOS, loanId, 'incoming');
            fs.mkdirSync(uploadPath, { recursive: true });
            callback(null, uploadPath);
          } catch (err) {
            callback(err as any, '');
          }
        },
        filename: (req, file, callback) => {
          try {
            // Use a temporary unique filename; we'll rename after upload.
            const safeName = file.originalname.replace(/[^\w\-.\s]/g, '');
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(null, `tmp-${uniqueSuffix}-${safeName}`);
          } catch {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(null, `tmp-${uniqueSuffix}`);
          }
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/i)) {
          return callback(new Error('Solo se permiten archivos JPG, PNG o PDF'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async createByCredit(
    @Param('id') id: number,
    @Req() req: any,
    @UploadedFile() file?: any,
  ) {
    try {
      console.log('📝 Body completo:', req.body);
      console.log('📎 Archivo recibido:', file);

      // Obtener datos del body
      const createPagoDto: CreatePagoDto = {
        idCuota: req.body.idCuota,
        metodoPagoId: req.body.metodoPagoId,
        diaDePago: req.body.diaDePago,
        diasEnMora: req.body.diasEnMora,
        mora: req.body.mora,
        abonoExtra: req.body.abonoExtra,
        totalPagado: req.body.totalPagado,
        abonoCapital: req.body.abonoCapital,
        intereses: req.body.intereses,
        proteccionCartera: req.body.proteccionCartera,
        monto: req.body.monto,
        numCuota: req.body.numCuota,
        fechaVencimiento: req.body.fechaVencimiento,
        idPago: undefined,
        idPrestamo: id,
      };

      // Mover/renombrar el archivo al directorio definitivo basado en año/mes
      let comprobanteValue = null;
      if (file && file.path && file.originalname) {
        const { year, month } = extractYearMonth(req.body?.diaDePago || req.body?.fechaVencimiento);
        const loanId = String(id);
        const finalDir = join(PATH_PAGOS, loanId, year);
        fs.mkdirSync(finalDir, { recursive: true });
        const safeName = file.originalname.replace(/[^\w\-.\s]/g, '');
        let targetName = `${month}-${safeName}`;
        let targetPath = join(finalDir, targetName);
        if (fs.existsSync(targetPath)) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          targetName = `${month}-${uniqueSuffix}-${safeName}`;
          targetPath = join(finalDir, targetName);
        }
        try {
          fs.renameSync(file.path, targetPath);
        } catch (moveErr) {
          console.error('Error moviendo comprobante:', moveErr);
        }
        comprobanteValue = `${loanId}/${year}/${targetName}`;
        console.log('💾 Comprobante guardado en ruta:', comprobanteValue);
      } else {
        console.log('⚠️ No se recibió archivo');
      }

      // Convertir strings a números (FormData envía todo como string)
      const pagoData = {
        ...createPagoDto,
        diasEnMora: createPagoDto.diasEnMora ? Number(createPagoDto.diasEnMora) : 0,
        mora: createPagoDto.mora ? Number(createPagoDto.mora) : 0,
        abonoExtra: createPagoDto.abonoExtra ? Number(createPagoDto.abonoExtra) : 0,
        totalPagado: createPagoDto.totalPagado ? Number(createPagoDto.totalPagado) : 0,
        abonoCapital: createPagoDto.abonoCapital ? Number(createPagoDto.abonoCapital) : 0,
        intereses: createPagoDto.intereses ? Number(createPagoDto.intereses) : 0,
        proteccionCartera: createPagoDto.proteccionCartera ? Number(createPagoDto.proteccionCartera) : 0,
        monto: createPagoDto.monto ? Number(createPagoDto.monto) : 0,
        numCuota: createPagoDto.numCuota ? Number(createPagoDto.numCuota) : 0,
        idCuota: createPagoDto.idCuota ? Number(createPagoDto.idCuota) : 0,
        metodoPagoId: createPagoDto.metodoPagoId ? Number(createPagoDto.metodoPagoId) : 0,
        comprobante: comprobanteValue,
      };

      console.log('✅ Datos procesados:', pagoData);
      console.log('🔍 Comprobante final:', pagoData.comprobante);
      console.log('💰 ABONO EXTRA procesado:', {
        valorOriginal: req.body.abonoExtra,
        tipoOriginal: typeof req.body.abonoExtra,
        valorConvertido: pagoData.abonoExtra,
        tipoConvertido: typeof pagoData.abonoExtra,
        esMayorACero: pagoData.abonoExtra > 0,
      });

      const result = await this.pagosService.createByCredit(id, pagoData);
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

  // Servir comprobantes de pagos anidados (loan-first): /pagos/comprobante/:loan/:year/:filename
  @Get('comprobante/:loan/:year/:filename')
  async serveLoanFirstComprobante(
    @Param('loan') loan: string,
    @Param('year') year: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      if ([loan, year, filename].some(p => !p) || filename.includes('..')) {
        return res.status(400).json({ message: 'Parámetros inválidos' });
      }
      const fullPath = join(PATH_PAGOS, loan, year, filename);
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ message: 'Comprobante no encontrado' });
      }
      return res.sendFile(fullPath);
    } catch (err) {
      return res.status(500).json({ message: 'Error al enviar comprobante', error: (err as any)?.message });
    }
  }

  // Ruta legacy para comprobantes planos en uploads/comprobantes/pagos
  @Get('comprobante/:filename')
  async serveLegacyComprobante(@Param('filename') filename: string, @Res() res: Response) {
    try {
      if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: 'Nombre de archivo inválido' });
      }
      const fullPath = join(PATH_PAGOS, filename);
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ message: 'Comprobante no encontrado' });
      }
      return res.sendFile(fullPath);
    } catch (err) {
      return res.status(500).json({ message: 'Error al enviar comprobante', error: (err as any)?.message });
    }
  }
}
