export class UpdateAsocAportesAsociadosDto {
    fechaAporte: Date;
    monto: number;
    observaciones: string | null;
    tipoAporte: string | null;
    estado: boolean | null;
    metodoPago: string | null;
    comprobante: string | null;
    idUsuarioRegistro: number | null;
    idAsociado: number;  // Solo el ID del Asociado
  }
  