import { Asociado } from "./User";
import { Cuota } from "./Cuota";

export type { Cuota };

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
  aplicaProteccionCartera?: boolean | null;
  porcentajeProteccionCartera?: number | null;

  // Relaciones con otras entidades
  aprobacionPrestamos?: any[];
  presCancelaciones?: any[];
  presCuotas?: Cuota[];
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
