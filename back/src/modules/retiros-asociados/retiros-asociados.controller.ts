import { Body, Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { RetirosAsociadosService } from './retiros-asociados.service';

@Controller('retiros-asociados')
export class RetirosAsociadosController {
  constructor(private readonly retirosService: RetirosAsociadosService) {}

  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.retirosService.findAll(estado);
  }

  @Get('saldos-negativos')
  findNegativeBalances() {
    return this.retirosService.findNegativeBalances();
  }

  @Get('calcular/:idAsociado')
  calculate(@Param('idAsociado') idAsociado: number) {
    return this.retirosService.calculate(idAsociado);
  }

  @Post(':idAsociado/solicitar')
  @UseInterceptors(FileInterceptor('adjunto', {
    storage: diskStorage({
      destination: (_req, _file, callback) => {
        const destination = join(process.cwd(), 'uploads', 'retiros');
        fs.mkdirSync(destination, { recursive: true });
        callback(null, destination);
      },
      filename: (_req, file, callback) => {
        callback(null, `retiro-${Date.now()}${extname(file.originalname).toLowerCase()}`);
      },
    }),
    fileFilter: (_req, file, callback) => callback(null, /\.(pdf|jpg|jpeg|png)$/i.test(file.originalname)),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  request(@Param('idAsociado') idAsociado: number, @Body() payload: any, @UploadedFile() file?: Express.Multer.File) {
    return this.retirosService.request(+idAsociado, { ...payload, adjunto: file ? `retiros/${file.filename}` : undefined });
  }

  @Post(':idRetiro/aprobar')
  approve(@Param('idRetiro') idRetiro: number) {
    return this.retirosService.approve(+idRetiro);
  }

  @Post(':idRetiro/rechazar')
  reject(@Param('idRetiro') idRetiro: number, @Body() payload: { motivoRechazo: string }) {
    return this.retirosService.reject(+idRetiro, payload.motivoRechazo);
  }

  @Post(':idRetiro/confirmar')
  confirm(@Param('idRetiro') idRetiro: number) {
    return this.retirosService.confirm(idRetiro);
  }
}