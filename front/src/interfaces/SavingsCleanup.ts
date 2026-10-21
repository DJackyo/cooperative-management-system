export interface CleanupRecord {
  id: number;
  id_asociado: number;
  fecha_aporte: string;
  monto: number;
  observaciones: string | null;
  tipo_aporte: string | null;
  estado: boolean | null;
  metodo_pago: string | null;
  comprobante: string | null;
  fecha_creacion: string | null;
  fecha_modificacion: string | null;
  id_usuario_registro: number | null;
}

export interface DuplicateSavingsGroup {
  idAsociado: number;
  periodo: string;
  nombres: string;
  identificacion: string | null;
  version: string;
  registros: CleanupRecord[];
}

export interface SavingsCleanupRequest {
  motivo: string;
  grupos: {
    idAsociado: number;
    periodo: string;
    version: string;
    ids: number[];
  }[];
}

export interface SavingsCleanupResult {
  auditoriaId: string;
  cantidad: number;
  montoEliminado: number;
}
