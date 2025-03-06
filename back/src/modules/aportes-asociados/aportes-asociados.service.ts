import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Asociados } from 'src/entities/entities/Asociados';
import { Repository } from 'typeorm';
import { CreateAsocAportesAsociadosDto } from './dto/create-aportes-asociado.dto';
import { UpdateAsocAportesAsociadosDto } from './dto/update-aportes-asociado.dto';
import { AsocAportesAsociados } from 'src/entities/entities/AsocAportesAsociados';

@Injectable()
export class AsocAportesAsociadosService {
  constructor(
    @InjectRepository(AsocAportesAsociados)
    private readonly AsocAportesAsociadosRepository: Repository<AsocAportesAsociados>,
    @InjectRepository(Asociados)
    private readonly asociadosRepository: Repository<Asociados>,
  ) {}

  // Crear un nuevo aporte
  async create(
    createAsocAportesAsociadosDto: CreateAsocAportesAsociadosDto,
  ): Promise<AsocAportesAsociados> {
    const { idAsociado, ...aporteData } = createAsocAportesAsociadosDto;

    // Obtener la entidad Asociado con el ID proporcionado
    const asociado = await this.asociadosRepository.findOne({
      where: { id: idAsociado }, // Usamos la opción `where` para especificar el ID
    });

    if (!asociado) {
      throw new Error('Asociado no encontrado');
    }

    // Crear el objeto AsocAportesAsociados
    const aporte = this.AsocAportesAsociadosRepository.create({
      ...aporteData,
      idAsociado: asociado, // Relacionar el objeto Asociado completo
    });

    console.log(aporte)

    // Guardar el aporte
    return this.AsocAportesAsociadosRepository.save(aporte);
  }

  // Obtener todos los aportes
  async findAll(): Promise<AsocAportesAsociados[]> {
    return this.AsocAportesAsociadosRepository.find({
      relations: ['idAsociado'],
    });
  }

  // Obtener un aporte por su ID
  async findOne(id: number): Promise<AsocAportesAsociados> {
    return this.AsocAportesAsociadosRepository.findOne({ where: { id } });
  }

  // Actualizar un aporte
  async update(
    id: number,
    updateAsocAportesAsociadosDto: UpdateAsocAportesAsociadosDto,
  ): Promise<AsocAportesAsociados> {
    const asociado = await this.asociadosRepository.findOne({
      where: { id: updateAsocAportesAsociadosDto.idAsociado },
    });

    if (!asociado) {
      throw new Error('Asociado no encontrado');
    }

    const aporte = await this.AsocAportesAsociadosRepository.findOne({
      where: { id },
    });

    if (!aporte) {
      throw new Error('Aporte no encontrado');
    }

    // Actualizamos las propiedades del aporte
    aporte.fechaAporte = updateAsocAportesAsociadosDto.fechaAporte;
    aporte.monto = updateAsocAportesAsociadosDto.monto;
    aporte.observaciones = updateAsocAportesAsociadosDto.observaciones;
    aporte.tipoAporte = updateAsocAportesAsociadosDto.tipoAporte;
    aporte.estado = updateAsocAportesAsociadosDto.estado;
    aporte.metodoPago = updateAsocAportesAsociadosDto.metodoPago;
    aporte.comprobante = updateAsocAportesAsociadosDto.comprobante;
    aporte.idUsuarioRegistro = updateAsocAportesAsociadosDto.idUsuarioRegistro;

    // Aquí asignamos el objeto `Asociado` en lugar de solo el ID
    aporte.idAsociado = asociado;

    // Guardamos los cambios
    return await this.AsocAportesAsociadosRepository.save(aporte);
  }

  // Eliminar un aporte
  async remove(id: number): Promise<void> {
    await this.AsocAportesAsociadosRepository.delete(id);
  }

  // Método para obtener los aportes filtrados con salida personalizada
  async findWithFilters(filter: { idAsociadoId?: number }): Promise<any> {
    const queryBuilder =
      this.AsocAportesAsociadosRepository.createQueryBuilder('aporte');

    // Aplicar filtro por idAsociadoId, si se proporciona
    if (filter.idAsociadoId) {
      queryBuilder
        .leftJoinAndSelect('aporte.idAsociado', 'asociado')
        .where('asociado.id = :idAsociadoId', {
          idAsociadoId: filter.idAsociadoId,
        });
    }

    // Obtener los datos de la base de datos
    const aportes = await queryBuilder.getMany();

    // Personalización de los datos antes de enviarlos
    const response = aportes.map((aporte) => ({
      ...aporte,
      estado: aporte.estado ? 'Activo' : 'Inactivo',
      idAsociado: {
        id: aporte.idAsociado.id,
        nombres: [
          aporte.idAsociado.nombre1,
          aporte.idAsociado.nombre2,
          aporte.idAsociado.apellido1,
          aporte.idAsociado.apellido2,
        ].join(' '),
        numeroDeIdentificacion: aporte.idAsociado.numeroDeIdentificacion,
        idEstado: aporte.idAsociado.idEstado,
      },
    }));

    return response;
  }
}
