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

  async calculate(idAsociado: number) {
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

  async findAll(estado?: string) {
    return this.retirosRepository.find({
      where: estado ? { estado } : undefined,
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
    const calculations = await Promise.all(asociados.map((asociado) => this.calculate(asociado.id)));
    return calculations.filter((calculation) => calculation.saldoNeto < 0);
  }

  async liquidate(idAsociado: number, payload: { fechaRetiro?: string; observaciones?: string; idUsuarioRegistro?: number }) {
    const calculation = await this.calculate(idAsociado);
    const existing = await this.retirosRepository.findOne({
      where: { asociado: { id: idAsociado }, estado: In(['PENDIENTE', 'PAGAR_DEVOLUCION', 'COBRAR_SALDO']) },
    });
    if (existing) throw new BadRequestException('Ya existe un retiro pendiente para este asociado');

    return this.dataSource.transaction(async (manager) => {
      const asociado = await manager.getRepository(Asociados).findOne({ where: { id: idAsociado } });
      if (!asociado) throw new NotFoundException('Asociado no encontrado');
      const retiro = manager.getRepository(RetirosAsociados).create({
        asociado,
        fechaRetiro: payload.fechaRetiro ? new Date(payload.fechaRetiro) : new Date(),
        fechaLiquidacion: new Date(),
        totalAportes: calculation.totalAportes,
        saldoCreditos: calculation.saldoCreditos,
        saldoNeto: calculation.saldoNeto,
        estado: calculation.resultado,
        observaciones: payload.observaciones || null,
        idUsuarioRegistro: payload.idUsuarioRegistro || null,
      });
      const saved = await manager.getRepository(RetirosAsociados).save(retiro);
      asociado.idEstado = { id: 4 } as any;
      asociado.esAsociado = false;
      asociado.fechaModificacion = new Date();
      await manager.getRepository(Asociados).save(asociado);
      return { retiro: saved, calculo: calculation };
    });
  }
}