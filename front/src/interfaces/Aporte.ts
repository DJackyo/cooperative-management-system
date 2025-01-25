export interface Aporte {
  fechaAporte: string;
  monto: number;
  observaciones: string | null;
  id: number;
  fechaModificacion: string;
  fechaCreacion: string;
  tipoAporte: "MENSUAL" | "ANUAL" | "EXTRAORDINARIO";
  estado: "Activo" | "Inactivo";
  metodoPago: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA";
  comprobante: string | null;
  idUsuarioRegistro: number | null;
  idAsociado: {
    id: number;
    nombres: string;
    numeroDeIdentificacion: string;
  };
}
