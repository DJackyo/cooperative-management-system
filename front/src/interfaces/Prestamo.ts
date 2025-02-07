import { Asociado } from "./User";

export interface Prestamo {
  id: number;
  fechaCredito: string | null;
  fechaVencimiento: string | null;
  monto: string;
  plazoMeses: number;
  cuotaMensual: string | null;
  fechaSolicitud: string | null;
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
