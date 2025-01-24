import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AportesAsociados } from 'src/entities/entities/AportesAsociados';
import { Asociados } from 'src/entities/entities/Asociados';
import { Repository } from 'typeorm';
import { CreateAportesAsociadosDto } from './dto/create-aportes-asociado.dto';
import { UpdateAportesAsociadosDto } from './dto/update-aportes-asociado.dto';

@Injectable()
export class AportesAsociadosService {
  constructor(
    @InjectRepository(AportesAsociados)
    private readonly aportesAsociadosRepository: Repository<AportesAsociados>,
    @InjectRepository(Asociados)
    private readonly asociadosRepository: Repository<Asociados>,
  ) {}

  // Crear un nuevo aporte
  async create(
    createAportesAsociadosDto: CreateAportesAsociadosDto,
  ): Promise<AportesAsociados> {
    const { idAsociado, ...aporteData } = createAportesAsociadosDto;

    // Obtener la entidad Asociado con el ID proporcionado
    const asociado = await this.asociadosRepository.findOne({
      where: { id: idAsociado }, // Usamos la opción `where` para especificar el ID
    });

    if (!asociado) {
      throw new Error('Asociado no encontrado');
    }

    // Crear el objeto AportesAsociados
    const aporte = this.aportesAsociadosRepository.create({
      ...aporteData,
      idAsociado: asociado, // Relacionar el objeto Asociado completo
    });

    // Guardar el aporte
    return this.aportesAsociadosRepository.save(aporte);
  }

  // Obtener todos los aportes
  async findAll(): Promise<AportesAsociados[]> {
    return this.aportesAsociadosRepository.find({
      relations: ['idAsociado'],
    });
  }

  // Obtener un aporte por su ID
  async findOne(id: number): Promise<AportesAsociados> {
    return this.aportesAsociadosRepository.findOne({ where: { id } });
  }

  // Actualizar un aporte
  async update(
    id: number,
    updateAportesAsociadosDto: UpdateAportesAsociadosDto,
  ): Promise<AportesAsociados> {
    const asociado = await this.asociadosRepository.findOne({
      where: { id: updateAportesAsociadosDto.idAsociado },
    });

    if (!asociado) {
      throw new Error('Asociado no encontrado');
    }

    const aporte = await this.aportesAsociadosRepository.findOne({
      where: { id },
    });

    if (!aporte) {
      throw new Error('Aporte no encontrado');
    }

    // Actualizamos las propiedades del aporte
    aporte.fechaAporte = updateAportesAsociadosDto.fechaAporte;
    aporte.monto = updateAportesAsociadosDto.monto;
    aporte.observaciones = updateAportesAsociadosDto.observaciones;
    aporte.tipoAporte = updateAportesAsociadosDto.tipoAporte;
    aporte.estado = updateAportesAsociadosDto.estado;
    aporte.metodoPago = updateAportesAsociadosDto.metodoPago;
    aporte.comprobante = updateAportesAsociadosDto.comprobante;
    aporte.idUsuarioRegistro = updateAportesAsociadosDto.idUsuarioRegistro;

    // Aquí asignamos el objeto `Asociado` en lugar de solo el ID
    aporte.idAsociado = asociado;

    // Guardamos los cambios
    return await this.aportesAsociadosRepository.save(aporte);
  }

  // Eliminar un aporte
  async remove(id: number): Promise<void> {
    await this.aportesAsociadosRepository.delete(id);
  }

  // Método para obtener los aportes filtrados con salida personalizada
  async findWithFilters(filter: { idAsociadoId?: number }): Promise<any> {
    const queryBuilder =
      this.aportesAsociadosRepository.createQueryBuilder('aporte');

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
