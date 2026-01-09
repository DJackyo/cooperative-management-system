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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
  @UseInterceptors(
    FileInterceptor('comprobante', {
      storage: diskStorage({
        destination: './uploads/comprobantes-pagos',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `pago-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
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
    @Body() createPagoDto: CreatePagoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      // Agregar la ruta del archivo al DTO si existe
      if (file) {
        createPagoDto.comprobante = file.filename;
      }
      
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
