import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { AsocAportesAsociados } from '../../entities/entities/AsocAportesAsociados';
import { Asociados } from '../../entities/entities/Asociados';
import { Prestamos } from '../../entities/entities/Prestamos';
import { RetirosAsociados } from '../../entities/entities/RetirosAsociados';

@Injectable()
export class RetirosAsociadosService {
  constructor(
    @InjectRepository(RetirosAsociados) private readonly retirosRepository: Repository<RetirosAsociados>,
    @InjectRepository(Asociados) private readonly asociadosRepository: Repository<Asociados>,
    @InjectRepository(AsocAportesAsociados) private readonly aportesRepository: Repository<AsocAportesAsociados>,
    @InjectRepository(Prestamos) private readonly prestamosRepository: Repository<Prestamos>,
    private readonly dataSource: DataSource,
  ) {}

  private async calculateAmounts(idAsociado: number) {
    const asociado = await this.asociadosRepository.findOne({
      where: { id: idAsociado },
      relations: ['idEstado'],
    });
    if (!asociado) throw new NotFoundException('Asociado no encontrado');

    const aportes = await this.aportesRepository.find({ where: { idAsociado: { id: idAsociado }, estado: true } });
    const prestamos = await this.prestamosRepository.find({
      where: { idAsociado: { id: idAsociado }, estado: 'APROBADO' },
      relations: ['presCuotas', 'presCuotas.presPagos'],
    });
    const totalAportes = aportes.reduce((total, aporte) => total + Number(aporte.monto || 0), 0);
    const saldoCreditos = prestamos.reduce((total, prestamo) => total + prestamo.presCuotas
      .filter((cuota) => cuota.estado !== 'PAGADA' && cuota.estado !== 'CANCELADA')
      .reduce((subtotal, cuota) => {
        const capitalProgramado = Number(cuota.abonoCapital ?? cuota.monto ?? 0);
        const capitalPagado = (cuota.presPagos || []).reduce((paid, pago) => paid + Number(pago.abonoCapital || 0), 0);
        return subtotal + Math.max(0, capitalProgramado - capitalPagado);
      }, 0), 0);
    const saldoNeto = totalAportes - saldoCreditos;

    return {
      asociado: {
        id: asociado.id,
        nombres: [asociado.nombre1, asociado.nombre2, asociado.apellido1, asociado.apellido2].filter(Boolean).join(' '),
        numeroDeIdentificacion: asociado.numeroDeIdentificacion,
        estado: asociado.idEstado?.estado,
      },
      totalAportes,
      saldoCreditos,
      saldoNeto,
      resultado: saldoNeto > 0 ? 'PAGAR_DEVOLUCION' : saldoNeto < 0 ? 'COBRAR_SALDO' : 'SALDO_CERO',
      creditos: prestamos.map((prestamo) => ({
        id: prestamo.id,
        monto: prestamo.monto,
        saldoPendiente: prestamo.presCuotas.filter((cuota) => cuota.estado !== 'PAGADA' && cuota.estado !== 'CANCELADA')
          .reduce((total, cuota) => total + Math.max(0, Number(cuota.abonoCapital ?? cuota.monto ?? 0) - (cuota.presPagos || []).reduce((paid, pago) => paid + Number(pago.abonoCapital || 0), 0)), 0),
      })),
    };
  }

  async calculate(idAsociado: number) {
    const approved = await this.retirosRepository.findOne({
      where: { asociado: { id: idAsociado }, estadoSolicitud: 'APROBADO' },
      order: { fechaSolicitud: 'DESC' },
    });
    if (!approved) throw new BadRequestException('El retiro debe ser aprobado antes de calcular el cruce');
    return this.calculateAmounts(idAsociado);
  }

  async findAll(estado?: string) {
    return this.retirosRepository.find({
      where: estado ? { estadoSolicitud: estado } : undefined,
      relations: ['asociado', 'asociado.idEstado'],
      order: { fechaSolicitud: 'DESC' },
    });
  }

  async findNegativeBalances() {
    const asociados = await this.asociadosRepository.find({
      where: { esAsociado: true },
      relations: ['idEstado'],
      order: { apellido1: 'ASC', nombre1: 'ASC' },
    });
    const calculations = await Promise.all(asociados.map((asociado) => this.calculateAmounts(asociado.id)));
    return calculations.filter((calculation) => calculation.saldoNeto < 0);
  }

  async request(idAsociado: number, payload: { fechaRetiro: string; motivo: string; adjunto?: string; idUsuarioRegistro?: number }) {
    const existing = await this.retirosRepository.findOne({
      where: { asociado: { id: idAsociado }, estadoSolicitud: In(['PENDIENTE', 'APROBADO']) },
    });
    if (existing) throw new BadRequestException('Ya existe una solicitud de retiro activa para este asociado');
    if (!payload.motivo?.trim()) throw new BadRequestException('El motivo del retiro es obligatorio');
    if (!payload.fechaRetiro) throw new BadRequestException('La fecha del retiro es obligatoria');
    if (!payload.adjunto) throw new BadRequestException('El adjunto del retiro es obligatorio');

    const asociado = await this.asociadosRepository.findOne({ where: { id: idAsociado } });
    if (!asociado) throw new NotFoundException('Asociado no encontrado');
    const retiro = this.retirosRepository.create({
      asociado,
      fechaRetiro: new Date(payload.fechaRetiro),
      motivo: payload.motivo.trim(),
      adjunto: payload.adjunto || null,
      estado: 'PENDIENTE',
      estadoSolicitud: 'PENDIENTE',
      idUsuarioRegistro: payload.idUsuarioRegistro || null,
    });
    const saved = await this.retirosRepository.save(retiro);
    return { retiro: saved };
  }

  async approve(idRetiro: number) {
    return this.dataSource.transaction(async (manager) => {
      const retiroRepository = manager.getRepository(RetirosAsociados);
      const asociadoRepository = manager.getRepository(Asociados);
      const retiro = await retiroRepository.findOne({
        where: { id: idRetiro },
        relations: ['asociado'],
      });
      if (!retiro) throw new NotFoundException('Solicitud de retiro no encontrada');
      if (retiro.estadoSolicitud !== 'PENDIENTE') throw new BadRequestException('La solicitud ya fue procesada');

      const asociado = await asociadoRepository.findOne({ where: { id: retiro.asociado.id } });
      if (!asociado) throw new NotFoundException('Asociado no encontrado');

      retiro.estadoSolicitud = 'APROBADO';
      asociado.idEstado = { id: 4 } as any;
      asociado.esAsociado = false;
      asociado.fechaModificacion = new Date();

      const saved = await retiroRepository.save(retiro);
      await asociadoRepository.save(asociado);
      return saved;
    });
  }

  async reject(idRetiro: number, motivoRechazo: string) {
    const retiro = await this.retirosRepository.findOne({ where: { id: idRetiro } });
    if (!retiro) throw new NotFoundException('Solicitud de retiro no encontrada');
    if (retiro.estadoSolicitud !== 'PENDIENTE') throw new BadRequestException('La solicitud ya fue procesada');
    if (!motivoRechazo?.trim()) throw new BadRequestException('El motivo de rechazo es obligatorio');
    retiro.estadoSolicitud = 'RECHAZADO';
    retiro.motivoRechazo = motivoRechazo.trim();
    return this.retirosRepository.save(retiro);
  }

  async confirm(idRetiro: number) {
    return this.dataSource.transaction(async (manager) => {
      const retiroRepository = manager.getRepository(RetirosAsociados);
      const retiro = await retiroRepository.findOne({
        where: { id: idRetiro },
        relations: ['asociado'],
      });
      if (!retiro) throw new NotFoundException('Solicitud de retiro no encontrada');
      if (retiro.estadoSolicitud !== 'APROBADO') throw new BadRequestException('La solicitud debe estar aprobada');

      const calculation = await this.calculateAmounts(retiro.asociado.id);
      const asociado = await manager.getRepository(Asociados).findOne({ where: { id: retiro.asociado.id } });
      if (!asociado) throw new NotFoundException('Asociado no encontrado');

      retiro.totalAportes = calculation.totalAportes;
      retiro.saldoCreditos = calculation.saldoCreditos;
      retiro.saldoNeto = calculation.saldoNeto;
      retiro.estado = calculation.resultado;
      retiro.fechaLiquidacion = new Date();
      const saved = await retiroRepository.save(retiro);
      asociado.idEstado = { id: 4 } as any;
      asociado.esAsociado = false;
      asociado.fechaModificacion = new Date();
      await manager.getRepository(Asociados).save(asociado);
      return { retiro: saved, calculo: calculation };
    });
  }
}