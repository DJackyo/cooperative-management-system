import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asociados } from 'src/entities/entities/Asociados';
import { AsocAportesAsociados } from 'src/entities/entities/AsocAportesAsociados';
import { Prestamos } from 'src/entities/entities/Prestamos';
import { PresPagos } from 'src/entities/entities/PresPagos';

export interface ConsultaReciboMensual {
  idAsociado: number;
  mes: number;
  anio: number;
}

export interface ReciboMensual {
  asociado: {
    id: number;
    nombres: string;
    numeroDeIdentificacion: string;
    estado: string | null;
    calidad: string;
  };
  periodo: { mes: number; anio: number; nombreMes: string };
  ahorro: {
    movimientos: Array<{ id: number; fecha: Date; monto: number; tipo: string | null; metodo: string | null }>;
    total: number;
  };
  credito: {
    pagos: Array<{
      id: number;
      creditoId: number;
      cuota: number | null;
      fecha: Date | null;
      capital: number;
      intereses: number;
      mora: number;
      proteccionCartera: number;
      abonoExtra: number;
      total: number;
      saldoCapital: number;
      metodo: string | null;
    }>;
    creditos: Array<{
      id: number;
      monto: number;
      cuotaMensual: number;
      estado: string | null;
      saldoCapital: number;
    }>;
    totalMes: number;
    saldoCapital: number;
  };
  totalRecibido: number;
  generadoEl: string;
}

@Injectable()
export class RecibosMensualesService {
  constructor(
    @InjectRepository(Asociados)
    private readonly asociadosRepository: Repository<Asociados>,
    @InjectRepository(AsocAportesAsociados)
    private readonly aportesRepository: Repository<AsocAportesAsociados>,
    @InjectRepository(Prestamos)
    private readonly prestamosRepository: Repository<Prestamos>,
  ) {}

  async obtenerRecibo(consulta: ConsultaReciboMensual): Promise<ReciboMensual> {
    this.validarConsulta(consulta);

    const asociado = await this.asociadosRepository.findOne({
      where: { id: consulta.idAsociado },
      relations: ['idEstado'],
    });
    if (!asociado) throw new NotFoundException('Asociado no encontrado');

    const aportes = await this.aportesRepository
      .createQueryBuilder('aporte')
      .where('aporte.idAsociado = :idAsociado', { idAsociado: consulta.idAsociado })
      .andWhere('aporte.estado = :estado', { estado: true })
      .andWhere('aporte.fechaAporte >= :inicio', { inicio: this.fechaInicio(consulta) })
      .andWhere('aporte.fechaAporte < :fin', { fin: this.fechaFin(consulta) })
      .orderBy('aporte.fechaAporte', 'ASC')
      .getMany();

    const prestamos = await this.prestamosRepository
      .createQueryBuilder('prestamo')
      .leftJoinAndSelect('prestamo.presCuotas', 'cuota')
      .leftJoinAndSelect('cuota.presPagos', 'pago')
      .leftJoinAndSelect('pago.metodoPago', 'metodoPago')
      .where('prestamo.idAsociado = :idAsociado', { idAsociado: consulta.idAsociado })
      .orderBy('prestamo.id', 'ASC')
      .getMany();

    const pagos = prestamos.flatMap((prestamo) => {
      let saldoCapital = Number(prestamo.monto || 0);
      const pagosHistoricos = (prestamo.presCuotas || [])
        .flatMap((cuota) => (cuota.presPagos || []).map((pago) => ({ pago, numeroCuota: cuota.numeroCuota })))
        .sort((a, b) => {
          const fechaA = a.pago.diaDePago ? new Date(a.pago.diaDePago).getTime() : 0;
          const fechaB = b.pago.diaDePago ? new Date(b.pago.diaDePago).getTime() : 0;
          return fechaA - fechaB || a.pago.idPago - b.pago.idPago;
        });

      return pagosHistoricos.flatMap(({ pago, numeroCuota }) => {
        const pagoMapeado = this.mapearPago(pago, prestamo.id, numeroCuota);
        saldoCapital = Math.max(saldoCapital - pagoMapeado.capital - pagoMapeado.abonoExtra, 0);
        pagoMapeado.saldoCapital = saldoCapital;
        return this.estaEnPeriodo(pago.diaDePago, consulta) ? [pagoMapeado] : [];
      });
    });

    const creditos = prestamos.map((prestamo) => {
      const pagosHistoricos = (prestamo.presCuotas || []).flatMap((cuota) => cuota.presPagos || []);
      const capitalPagado = pagosHistoricos.reduce(
        (total, pago) => total + Number(pago.abonoCapital || 0) + Number(pago.abonoExtra || 0),
        0,
      );
      return {
        id: prestamo.id,
        monto: Number(prestamo.monto || 0),
        cuotaMensual: Number(prestamo.cuotaMensual || 0),
        estado: prestamo.estado,
        saldoCapital: Math.max(Number(prestamo.monto || 0) - capitalPagado, 0),
      };
    });

    const ahorro = aportes.map((aporte) => ({
      id: aporte.id,
      fecha: aporte.fechaAporte,
      monto: Number(aporte.monto || 0),
      tipo: aporte.tipoAporte,
      metodo: aporte.metodoPago,
    }));
    const totalAhorro = ahorro.reduce((total, aporte) => total + aporte.monto, 0);
    const totalCredito = pagos.reduce((total, pago) => total + pago.total, 0);

    return {
      asociado: {
        id: asociado.id,
        nombres: [asociado.nombre1, asociado.nombre2, asociado.apellido1, asociado.apellido2].filter(Boolean).join(' '),
        numeroDeIdentificacion: asociado.numeroDeIdentificacion,
        estado: asociado.idEstado?.estado || null,
        calidad: asociado.esAsociado === false ? 'NO ASOCIADO' : 'ASOCIADO',
      },
      periodo: { mes: consulta.mes, anio: consulta.anio, nombreMes: this.nombreMes(consulta.mes) },
      ahorro: { movimientos: ahorro, total: totalAhorro },
      credito: {
        pagos,
        creditos,
        totalMes: totalCredito,
        saldoCapital: creditos.reduce((total, credito) => total + credito.saldoCapital, 0),
      },
      totalRecibido: totalAhorro + totalCredito,
      generadoEl: new Date().toISOString(),
    };
  }

  private mapearPago(pago: PresPagos, creditoId: number, cuota: number | null) {
    const capital = Number(pago.abonoCapital || 0);
    const intereses = Number(pago.intereses || 0);
    const mora = Number(pago.mora || 0);
    const proteccionCartera = Number(pago.proteccionCartera || 0);
    const abonoExtra = Number(pago.abonoExtra || 0);
    const total = Number(pago.totalPagado || 0) || capital + intereses + mora + proteccionCartera + abonoExtra || Number(pago.monto || 0);
    return {
      id: pago.idPago,
      creditoId,
      cuota,
      fecha: pago.diaDePago,
      capital,
      intereses,
      mora,
      proteccionCartera,
      abonoExtra,
      total,
      saldoCapital: 0,
      metodo: pago.metodoPago?.nombre || null,
    };
  }

  private validarConsulta(consulta: ConsultaReciboMensual) {
    if (!Number.isInteger(consulta.idAsociado) || consulta.idAsociado <= 0) {
      throw new BadRequestException('El id del asociado es inválido.');
    }
    if (!Number.isInteger(consulta.mes) || consulta.mes < 1 || consulta.mes > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12.');
    }
    if (!Number.isInteger(consulta.anio) || consulta.anio < 2000 || consulta.anio > 2100) {
      throw new BadRequestException('El año no es válido.');
    }
  }

  private fechaInicio({ mes, anio }: ConsultaReciboMensual): string {
    return `${anio}-${String(mes).padStart(2, '0')}-01`;
  }

  private fechaFin({ mes, anio }: ConsultaReciboMensual): string {
    return mes === 12 ? `${anio + 1}-01-01` : `${anio}-${String(mes + 1).padStart(2, '0')}-01`;
  }

  private estaEnPeriodo(fecha: Date | null, consulta: ConsultaReciboMensual): boolean {
    if (!fecha) return false;
    const valor = new Date(fecha);
    return valor.getFullYear() === consulta.anio && valor.getMonth() + 1 === consulta.mes;
  }

  private nombreMes(mes: number): string {
    return new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(new Date(2020, mes - 1, 1));
  }
}
