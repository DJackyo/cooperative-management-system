import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asociados } from '../../entities/entities/Asociados';
import { AsociadoDto } from './dto/asociado.dto';
import { UpdateAsociadoDto } from './dto/update-asociado.dto';
import { EstadosAsociado } from '../../entities/entities/EstadosAsociado';
import { AsocContactos } from '../../entities/entities/AsocContactos';
import { AsocUbicaciones } from '../../entities/entities/AsocUbicaciones';
import { AsocInformacionLaboral } from '../../entities/entities/AsocInformacionLaboral';
import { AsocEconomicaSocial } from '../../entities/entities/AsocEconomicaSocial';
import { AsocInformacionFamiliar } from '../../entities/entities/AsocInformacionFamiliar';
import { AsocAsistenciaAsamblea } from '../../entities/entities/AsocAsistenciaAsamblea';

@Injectable()
export class AsociadosService {
  constructor(
    @InjectRepository(Asociados)
    private readonly asociadosRepository: Repository<Asociados>,  // El repositorio de la entidad Asociados
    @InjectRepository(AsocContactos)
    private readonly contactosRepository: Repository<AsocContactos>,
    @InjectRepository(AsocUbicaciones)
    private readonly ubicacionesRepository: Repository<AsocUbicaciones>,
    @InjectRepository(AsocInformacionLaboral)
    private readonly laboralRepository: Repository<AsocInformacionLaboral>,
    @InjectRepository(AsocEconomicaSocial)
    private readonly economicaRepository: Repository<AsocEconomicaSocial>,
    @InjectRepository(AsocInformacionFamiliar)
    private readonly familiarRepository: Repository<AsocInformacionFamiliar>,
    @InjectRepository(AsocAsistenciaAsamblea)
    private readonly asistenciaRepository: Repository<AsocAsistenciaAsamblea>,
  ) {}

  // Obtener todos los asociados, incluyendo las relaciones
  async getAll(): Promise<Asociados[]> {
    return this.asociadosRepository.find({
      relations: ['tipoIdentificacion', 'idEstado'],  // Cargamos las relaciones
    });
  }

  // Obtener un asociado por id, incluyendo las relaciones
  async getOne(id: number): Promise<Asociados> {
    const asociado = await this.asociadosRepository.findOne({
      where: { id },
      relations: ['tipoIdentificacion', 'idEstado'],  // Cargamos las relaciones
    });

    if (!asociado) {
      throw new NotFoundException('Asociado no encontrado');
    }

    return asociado;
  }

  async getAssemblyAttendance() {
    const records = await this.asistenciaRepository.find({
      relations: ['idAsociado2', 'idAsociado2.idEstado'],
      order: { fecha: 'DESC' },
    });

    return records.map((record) => ({
      idAsociado: record.idAsociado,
      fecha: record.fecha,
      asistio: record.asistio,
      asociado: record.idAsociado2,
    }));
  }

  async getFullProfile(id: number) {
    const asociado = await this.asociadosRepository.findOne({
      where: { id },
      relations: [
        'tipoIdentificacion', 'idEstado', 'ubicacion', 'asocContactos',
        'asocInformacionLaboral', 'asocEconomicaSocial',
        'asocAsistenciaAsamblea', 'asocInformacionFamiliars',
        'asocInformacionFamiliars.tipoFamiliar',
      ],
    });
    if (!asociado) throw new NotFoundException('Asociado no encontrado');

    return {
      asociado,
      contactos: asociado.asocContactos || null,
      ubicacion: asociado.ubicacion || null,
      laboral: asociado.asocInformacionLaboral || null,
      economica: asociado.asocEconomicaSocial || null,
      asistencia: asociado.asocAsistenciaAsamblea || null,
      familiares: asociado.asocInformacionFamiliars || [],
    };
  }

  async updateFullProfile(id: number, profile: any) {
    const asociado = await this.asociadosRepository.findOne({ where: { id } });
    if (!asociado) throw new NotFoundException('Asociado no encontrado');

    if (profile.asociado) {
      const asociadoData = { ...profile.asociado };
      if (asociadoData.idEstado && typeof asociadoData.idEstado === 'object') {
        asociadoData.idEstado = asociadoData.idEstado.id;
      }
      delete asociadoData.id;
      delete asociadoData.tipoIdentificacion;
      delete asociadoData.ubicacion;
      delete asociadoData.asocContactos;
      delete asociadoData.asocInformacionLaboral;
      delete asociadoData.asocEconomicaSocial;
      delete asociadoData.asocAsistenciaAsamblea;
      delete asociadoData.asocInformacionFamiliars;
      await this.update(id, asociadoData);
    }
    const relation = { idAsociado: id };
    const saveRelation = async (repository: Repository<any>, data: any) => {
      if (!data) return;
      const current = await repository.findOne({ where: relation });
      await repository.save(repository.create({ ...current, ...data, ...relation }));
    };

    await saveRelation(this.contactosRepository, profile.contactos);
    if (profile.ubicacion) {
      const currentUbicacion = profile.ubicacion.id
        ? await this.ubicacionesRepository.findOne({ where: { id: profile.ubicacion.id } })
        : null;
      const ubicacion = await this.ubicacionesRepository.save(
        this.ubicacionesRepository.create({ ...currentUbicacion, ...profile.ubicacion }),
      ) as unknown as AsocUbicaciones;
      asociado.ubicacion = ubicacion;
      await this.asociadosRepository.save(asociado);
    }
    await saveRelation(this.laboralRepository, profile.laboral);
    await saveRelation(this.economicaRepository, profile.economica);
    await saveRelation(this.asistenciaRepository, profile.asistencia);

    if (Array.isArray(profile.familiares)) {
      for (const familiar of profile.familiares) {
        const familiarData = { ...familiar };
        delete familiarData.tipoFamiliar;
        delete familiarData.tipoFamiliarId;
        if (familiar.tipoFamiliarId) {
          familiarData.tipoFamiliar = { id: familiar.tipoFamiliarId };
        }
        if (familiar.id) {
          await this.familiarRepository.save({ ...familiarData, idAsociado: asociado });
        } else {
          await this.familiarRepository.save(
            this.familiarRepository.create({ ...familiarData, idAsociado: asociado }),
          );
        }
      }
    }

    return this.getFullProfile(id);
  }

  // Crear un nuevo asociado
  async create(asociadoDto: AsociadoDto): Promise<Asociados> {
    const asociado = this.asociadosRepository.create(asociadoDto);  // Creamos el nuevo objeto asociado con el DTO
    try {
      return await this.asociadosRepository.save(asociado);  // Guardamos el objeto en la base de datos
    } catch (err: any) {
      if (err && err.code === '23505') {
        if (err.detail && err.detail.includes('numero_de_identificacion')) {
          throw new BadRequestException('Ya existe un asociado con esa identificación');
        }
      }
      throw err;
    }
  }

  // Actualizar un asociado
  async update(id: number, updateAsociadoDto: UpdateAsociadoDto): Promise<Asociados> {
    const asociado = await this.asociadosRepository.findOne({ where: { id } });
    if (!asociado) {
      throw new NotFoundException('Asociado no encontrado');
    }
    const { idEstado, ...asociadoData } = updateAsociadoDto;
    Object.assign(asociado, asociadoData);
    if (idEstado !== undefined) {
      asociado.idEstado = { id: idEstado } as EstadosAsociado;
    }
    return this.asociadosRepository.save(asociado);  // Guardamos el asociado actualizado
  }

  // Eliminar un asociado por id
  async deleteOne(id: number): Promise<Asociados> {
    const asociado = await this.asociadosRepository.findOne({ where: { id } });
    if (!asociado) {
      throw new NotFoundException('Asociado no encontrado');
    }
    return this.asociadosRepository.remove(asociado);  // Eliminamos el asociado encontrado
  }
}
