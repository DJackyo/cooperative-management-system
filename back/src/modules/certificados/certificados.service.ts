import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asociados } from 'src/entities/entities/Asociados';
import { AsocAportesAsociados } from 'src/entities/entities/AsocAportesAsociados';
import { Prestamos } from 'src/entities/entities/Prestamos';

export type TipoCertificado = 'ahorro' | 'credito' | 'completo';

export interface ConsultaEstadoCuenta {
  idAsociado: number;
  tipo: TipoCertificado;
  desde?: string;
  hasta?: string;
}

export interface MovimientoAhorro {
  id: number;
  fechaAporte: Date | null;
  monto: number;
  tipoAporte: string | null;
  metodoPago: string | null;
  observaciones: string | null;
  estado: boolean | null;
}

export interface DetalleCredito {
  id: number;
  fechaCredito: Date | null;
  fechaVencimiento: Date | null;
  monto: number;
  cuotaMensual: number | null;
  plazoMeses: number;
  estado: string | null;
  tasa: string | null;
  numCuotasPagadas: number;
  numCuotas: number;
  totalPagado: number;
  saldoPendiente: number;
}

export interface EstadoCuentaAhorro {
  totalAportado: number;
  numAportes: number;
  ultimaFechaAporte: string | null;
  movimientos: MovimientoAhorro[];
}

export interface EstadoCuentaCredito {
  numCreditos: number;
  creditosActivos: number;
  montoSolicitadoTotal: number;
  totalPagadoGeneral: number;
  saldoPendienteTotal: number;
  creditos: DetalleCredito[];
}

export interface EstadoCuentaAsociado {
  asociado: {
    id: number;
    nombres: string;
    numeroDeIdentificacion: string;
  };
  generadoEl: string;
  consulta: ConsultaEstadoCuenta;
  ahorro: EstadoCuentaAhorro | null;
  credito: EstadoCuentaCredito | null;
}
@Injectable()
export class CertificadosService {
  constructor(
    @InjectRepository(Asociados)
    private readonly asociadosRepository: Repository<Asociados>,
    @InjectRepository(AsocAportesAsociados)
    private readonly aportesRepository: Repository<AsocAportesAsociados>,
    @InjectRepository(Prestamos)
    private readonly prestamosRepository: Repository<Prestamos>,
  ) {}

  /** Obtiene los datos consolidados del estado de cuenta de un asociado */
  async obtenerEstadoCuenta(consulta: ConsultaEstadoCuenta): Promise<EstadoCuentaAsociado> {
    const asociado = await this.asociadosRepository.findOne({
      where: { id: consulta.idAsociado },
    });

    if (!asociado) {
      throw new NotFoundException('Asociado no encontrado');
    }

    const nombres = [asociado.nombre1, asociado.nombre2, asociado.apellido1, asociado.apellido2]
      .filter(Boolean)
      .join(' ');

    const incluirAhorro = consulta.tipo === 'ahorro' || consulta.tipo === 'completo';
    const incluirCredito = consulta.tipo === 'credito' || consulta.tipo === 'completo';

    const [ahorro, credito] = await Promise.all([
      incluirAhorro ? this.obtenerEstadoCuentaAhorro(consulta) : Promise.resolve(null),
      incluirCredito ? this.obtenerEstadoCuentaCredito(consulta) : Promise.resolve(null),
    ]);

    return {
      asociado: {
        id: asociado.id,
        nombres,
        numeroDeIdentificacion: asociado.numeroDeIdentificacion,
      },
      generadoEl: new Date().toISOString(),
      consulta,
      ahorro,
      credito,
    };
  }
/** Consolidación del estado de cuenta de AHORRO */
  private async obtenerEstadoCuentaAhorro(
    consulta: ConsultaEstadoCuenta,
  ): Promise<EstadoCuentaAhorro> {
    const query = this.aportesRepository
      .createQueryBuilder('aporte')
      .where('aporte.id_asociado = :idAsociado', {
        idAsociado: consulta.idAsociado,
      });

    if (consulta.desde) {
      query.andWhere('aporte.fecha_aporte >= :desde', { desde: consulta.desde });
    }
    if (consulta.hasta) {
      query.andWhere('aporte.fecha_aporte <= :hasta', { hasta: consulta.hasta });
    }

    const movimientos = (await query.orderBy('aporte.fecha_aporte', 'DESC').getMany()) as MovimientoAhorro[];

    const totalAportado = movimientos.reduce((acc, m) => acc + Number(m.monto || 0), 0);

    return {
      totalAportado,
      numAportes: movimientos.length,
      ultimaFechaAporte: movimientos.length
        ? movimientos
            .map((m) => (m.fechaAporte ? new Date(m.fechaAporte).toISOString() : null))
            .filter(Boolean)[0]
        : null,
      movimientos: movimientos.map((m) => ({
        id: m.id,
        fechaAporte: m.fechaAporte,
        monto: Number(m.monto || 0),
        tipoAporte: m.tipoAporte,
        metodoPago: m.metodoPago,
        observaciones: m.observaciones,
        estado: m.estado,
      })),
    };
  }

  /** Consolidación del estado de cuenta de CRÉDITO */
  private async obtenerEstadoCuentaCredito(
    consulta: ConsultaEstadoCuenta,
  ): Promise<EstadoCuentaCredito> {
    const prestamos = await this.prestamosRepository.find({
      where: { idAsociado: { id: consulta.idAsociado } } as any,
      relations: ['idTasa', 'presCuotas', 'presCuotas.presPagos'],
      order: { fechaCredito: 'DESC' },
    });

    const creditos: DetalleCredito[] = prestamos.map((p) => {
      const cuotas = Array.isArray(p.presCuotas) ? p.presCuotas : [];
      const pagos = cuotas.reduce(
        (acc, c) => acc.concat(Array.isArray(c.presPagos) ? c.presPagos : []),
        [] as any[],
      );

      const numCuotas = cuotas.length;
      const numCuotasPagadas = cuotas.filter((c) => c.estado === 'PAGADO').length;
      const totalPagado = pagos.reduce(
        (acc, pago) => acc + Number(pago.totalPagado ?? pago.monto ?? 0),
        0,
      );
      const saldoPendiente = Math.max(Number(p.monto || 0) - totalPagado, 0);

      return {
        id: p.id,
        fechaCredito: p.fechaCredito,
        fechaVencimiento: p.fechaVencimiento,
        monto: Number(p.monto || 0),
        cuotaMensual: Number(p.cuotaMensual || 0),
        plazoMeses: Number(p.plazoMeses || 0),
        estado: p.estado,
        tasa: p.idTasa ? String(p.idTasa.tasa) : null,
        numCuotasPagadas,
        numCuotas,
        totalPagado,
        saldoPendiente,
      };
    });

    const montoSolicitadoTotal = creditos.reduce((acc, c) => acc + c.monto, 0);
    const totalPagadoGeneral = creditos.reduce((acc, c) => acc + c.totalPagado, 0);
    const saldoPendienteTotal = creditos.reduce((acc, c) => acc + c.saldoPendiente, 0);

    const estadosActivos = ['ACTIVO', 'APROBADO', 'DESEMBOLSADO', 'EN_PAGO'];
    const creditosActivos = creditos.filter((c) =>
      c.estado ? estadosActivos.includes(c.estado.toUpperCase()) : true,
    ).length;

    return {
      numCreditos: creditos.length,
      creditosActivos,
      montoSolicitadoTotal,
      totalPagadoGeneral,
      saldoPendienteTotal,
      creditos,
    };
  }
/** Devuelve el tipo de certificado validado */
  static normalizarTipo(tipo?: string): TipoCertificado {
    const valor = (tipo || 'completo').toLowerCase();
    if (!['ahorro', 'credito', 'completo'].includes(valor)) {
      throw new BadRequestException(
        "Tipo inválido. Use 'ahorro', 'credito' o 'completo'.",
      );
    }
    return valor as TipoCertificado;
  }

  static validarRangos(desde?: string, hasta?: string): null {
    const patron = /^\d{4}-\d{2}-\d{2}$/;
    if (desde && !patron.test(desde)) {
      throw new BadRequestException(
        'La fecha "desde" debe tener formato YYYY-MM-DD.',
      );
    }
    if (hasta && !patron.test(hasta)) {
      throw new BadRequestException(
        'La fecha "hasta" debe tener formato YYYY-MM-DD.',
      );
    }
    if (desde && hasta && desde > hasta) {
      throw new BadRequestException(
        'La fecha "desde" no puede ser posterior a "hasta".',
      );
    }
    return null;
  }
}