import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Response, Request } from 'express';
import { AsocAportesAsociadosService } from './aportes-asociados.service';
import { CreateAsocAportesAsociadosDto } from './dto/create-aportes-asociado.dto';
import { UpdateAsocAportesAsociadosDto } from './dto/update-aportes-asociado.dto';
import { AsocAportesAsociados } from '../../entities/entities/AsocAportesAsociados';

@Controller('aportes-asociados')
export class AsocAportesAsociadosController {
  constructor(
    private readonly AsocAportesAsociadosService: AsocAportesAsociadosService,
  ) {}

  // Crear un nuevo aporte
  @Post()
  @UseInterceptors(
    FileInterceptor('comprobante', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const fechaAporte = req.body.fechaAporte;
          const idAsociado = req.body.idAsociado;
          
          // Obtener año de la fecha de aporte
          const year = new Date(fechaAporte).getFullYear();
          
          // Crear estructura: uploads/comprobantes/año/idAsociado
          const uploadPath = join('./uploads/comprobantes', year.toString(), idAsociado.toString());
          
          // Crear directorios si no existen
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const fechaAporte = req.body.fechaAporte;
          const formattedDate = new Date(fechaAporte).toISOString().split('T')[0];
          const fileExt = extname(file.originalname);
          cb(null, `comprobante-${formattedDate}${fileExt}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo de archivo no permitido'), false);
        }
      },
    }),
  )
  create(
    @Body() createAsocAportesAsociadosDto: CreateAsocAportesAsociadosDto,
    @UploadedFile() file?: any,
  ): Promise<AsocAportesAsociados> {
    if (file) {
      const fechaAporte = createAsocAportesAsociadosDto.fechaAporte;
      const idAsociado = createAsocAportesAsociadosDto.idAsociado;
      const year = new Date(fechaAporte).getFullYear();
      
      // Guardar ruta relativa en la base de datos
      createAsocAportesAsociadosDto.comprobante = `${year}/${idAsociado}/${file.filename}`;
    }
    return this.AsocAportesAsociadosService.create(createAsocAportesAsociadosDto);
  }

  // Obtener todos los aportes
  @Get()
  findAll(): Promise<AsocAportesAsociados[]> {
    return this.AsocAportesAsociadosService.findAll();
  }

  // Obtener resumen de usuarios (debe ir antes de :id)
  @Get('users-summary')
  async getUsersSummary() {
    return this.AsocAportesAsociadosService.getUsersSummary();
  }

  // Obtener un aporte por su ID
  @Get(':id')
  findOne(@Param('id') id: number): Promise<AsocAportesAsociados> {
    return this.AsocAportesAsociadosService.findOne(id);
  }

  // Actualizar un aporte
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateAsocAportesAsociadosDto: UpdateAsocAportesAsociadosDto,
  ): Promise<AsocAportesAsociados> {
    return this.AsocAportesAsociadosService.update(id, updateAsocAportesAsociadosDto);
  }

  // Eliminar un aporte
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.AsocAportesAsociadosService.remove(id);
  }

  @Post('findWithFilters')
  async findWithFilters(@Body() filter: { idAsociadoId?: number }) {
    return this.AsocAportesAsociadosService.findWithFilters(filter);
  }

  // Servir archivos de comprobantes
  @Get('comprobante/:year/:id/:filename')
  serveComprobante(
    @Param('year') year: string,
    @Param('id') id: string,
    @Param('filename') filename: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Construir filepath a partir de parámetros explícitos
    const filepath = `${year}/${id}/${filename}`;

    // Log básico para depuración
    console.log('[serveComprobante] requested:', { filepath, originalUrl: req.originalUrl, params: req.params });

    const fullPath = join(process.cwd(), 'uploads', 'comprobantes', filepath);

    // Verificar que el archivo exista antes de intentar enviarlo
    if (!existsSync(fullPath)) {
      return res.status(404).json({ message: 'Comprobante no encontrado' });
    }

    // Enviar el archivo y manejar posibles errores durante el envío
    return res.sendFile(fullPath, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al enviar el comprobante', error: err.message });
      }
    });
  }
}
