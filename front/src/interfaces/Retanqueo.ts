export interface RetanqueoDto {
  idAsociado: number;
  idPrestamoOrigen: number;
  montoNuevo: number;
  plazoMeses: number;
  idTasa?: any;
  aplicaProteccionCartera?: boolean;
  fechaCredito?: Date | string;
  fechaVencimiento?: Date | string;
  fechaDesembolso?: Date | string;
  observaciones?: string;
  estado?: string; // 'APROBADO' o 'SOLICITADO'
}

export interface LiquidacionRetanqueo {
  prestamoId: number;
  asociado: {
    id: number;
    nombres: string;
    numeroDeIdentificacion: string;
  } | null;
  montoOriginal: number;
  plazoMeses: number;
  tasa: number | null;
  cuotasTotales: number;
  cuotasPagadas: number;
  cuotasPendientes: number;
  cuotasVencidas: number;
  totalCapitalPagado: number;
  totalAbonosExtra: number;
  totalInteresesPagados: number;
  saldoCapital: number;
  interesesVencidos: number;
  moraTotal: number;
  totalALiquidar: number;
}

export interface CreditoRetanqueable {
  id: number;
  monto: number;
  saldoRetanqueo: number | null;
  totalALiquidar: number;
  fechaCredito: string | null;
  fechaVencimiento: string | null;
  plazoMeses: number;
  estado: string | null;
  idAsociado: any;
  idTasa: any;
  presCuotas: any[];
  esRetanqueo: boolean | null;
  aplicaProteccionCartera: boolean | null;
  tasa?: number | null;
  liquidacion?: LiquidacionRetanqueo;
}

export interface TrazaRetanqueo {
  id: number;
  fechaRetanqueo: string | null;
  numeroRecibo: string | null;
  estado: string | null;
  montoOrigen: number;
  montoNuevo: number;
  saldoLiquidado: number;
  desembolsoNeto: number;
  plazoMeses: number;
  observaciones: string | null;
  detalleLiquidacion: string | null;
  idPrestamoOrigen: any;
  idPrestamoNuevo: any;
  idAsociado: any;
  idUsuario: any;
}
