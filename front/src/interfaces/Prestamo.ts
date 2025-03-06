import { Asociado } from "./User";

export interface Prestamo {
  id: number;
  fechaCredito: string | null;
  fechaVencimiento: string;
  monto: string;
  plazoMeses: number;
  cuotaMensual: string | null;
  fechaSolicitud: string;
  fechaDesembolso: string | null;
  estado: string | null;
  observaciones: string | null;
  fechaActualizacion: string | null;

  // Relaciones con otras entidades
  aprobacionPrestamos?: any[];
  presCancelaciones?: any[];
  presCuotas?: any[];
  presHistorialPrestamos?: any[];
  presPagos?: any[];
  idAsociado: Asociado;
  idTasa: any;
}

export interface Pago {
  id?: number;
  diaDePago?: string;
  montoPagado?: number;
}

export interface Cuota {
  id: number;
  numeroCuota: number;
  fechaVencimiento: string;
  monto: number;
  estado: "PENDIENTE" | "PAGADO";
  presPagos: Pago[];
  pagado: boolean;
}
