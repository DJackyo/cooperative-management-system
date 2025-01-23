import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { AsociadosService } from './asociados.service';
import { AsociadoDto } from './dto/asociado.dto';
import { UpdateAsociadoDto } from './dto/update-asociado.dto';  // DTO para actualizaciones

@Controller('asociados')
export class AsociadosController {
  constructor(private readonly asociadosService: AsociadosService) {}

   // Ruta para obtener todos los asociados
   @Get()
   async getAll() {
     const asociados = await this.asociadosService.getAll();
     return asociados.map(asociado => ({
       ...asociado,
       tipoIdentificacion: asociado.tipoIdentificacion?.nombre,  // Mostramos el nombre de la relación tipoIdentificacion
       estado: asociado.idEstado?.estado,  // Mostramos el nombre del estado
     }));
   }

  // Ruta para obtener un asociado por id
  @Get(':id')
  async getAsociado(@Param('id') id: number) {
    return this.asociadosService.getOne(id);  // Llamamos al servicio pasando el id
  }

  // Ruta para crear un nuevo asociado
  @Post()
  async createAsociado(@Body() asociadoDto: AsociadoDto) {
    return this.asociadosService.create(asociadoDto);  // Llamamos al servicio pasando el DTO
  }

  // Ruta para actualizar un asociado por id
  @Put(':id')
  async updateAsociado(
    @Param('id') id: number,
    @Body() updateAsociadoDto: UpdateAsociadoDto,
  ) {
    return this.asociadosService.update(id, updateAsociadoDto);  // Llamamos al servicio pasando el id y DTO
  }

  // Ruta para eliminar un asociado por id
  @Delete(':id')
  async deleteAsociado(@Param('id') id: number) {
    return this.asociadosService.deleteOne(id);  // Llamamos al servicio pasando el id
  }
}
