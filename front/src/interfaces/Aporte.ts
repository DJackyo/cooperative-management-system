export interface Aporte {
  fechaAporte: string;
  monto: number;
  observaciones: string | null;
  id: number;
  fechaModificacion: string;
  fechaCreacion: string;
  tipoAporte: "MENSUAL" | "ANUAL" | "EXTRAORDINARIO";
  estado: boolean;
  metodoPago: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA";
  comprobante: string | null;
  idUsuarioRegistro: number | null;
  asociado: {
    id: number;
    nombres: string;
    numeroDeIdentificacion: string;
  };
  idAsociado: number;
  file?: File;
}
