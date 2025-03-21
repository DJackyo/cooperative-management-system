export interface Cuota {
  id: number;
  numeroCuota: number;
  fechaVencimiento: string;
  diaDePago: string;
  monto: number;
  diasEnMora: number;
  mora: number;
  totalPagar: number;
  estado: "PENDIENTE" | "PAGADO";
  proteccionCartera: number;
  abonoCapital: number;
  intereses: number;
  abonoExtra: number;
  pagado: boolean;
}

export interface MetodoPago {
  id: number;
  nombre: string;
}
