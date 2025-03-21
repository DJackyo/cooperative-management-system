export class CreatePagoDto {
  idPago: number;
  idPrestamo: number;
  fechaVencimiento?: Date | null;
  diasEnMora?: number | null;
  diaDePago?: Date | null;
  numCuota?: number | null;
  abonoExtra?: number | null;
  proteccionCartera?: number | null;
  abonoCapital?: number | null;
  intereses?: number | null;
  monto?: number | null;
  mora?: number | null;
  totalPagado?: number | null;
  idCuota?: number; // Solo el ID de la cuota para evitar ciclos de referencia
  metodoPagoId?: number; // Solo el ID del método de pago para simplificar
}
