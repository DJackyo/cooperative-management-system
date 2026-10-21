-- Migracion: tabla de traza de retanqueos
-- Conserva el registro completo y auditable de cada operacion de retanqueo
CREATE TABLE IF NOT EXISTS pres_retanqueos (
  id SERIAL PRIMARY KEY,
  fecha_retanqueo TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  id_prestamo_origen INTEGER NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
  id_prestamo_nuevo INTEGER NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
  id_asociado INTEGER NOT NULL REFERENCES asociados(id) ON DELETE CASCADE,
  id_usuario INTEGER NULL REFERENCES usuarios(id) ON DELETE SET NULL,
  monto_origen INTEGER DEFAULT 0,
  monto_nuevo INTEGER DEFAULT 0,
  saldo_liquidado NUMERIC(14, 2) DEFAULT 0,
  desembolso_neto NUMERIC(14, 2) DEFAULT 0,
  plazo_meses INTEGER DEFAULT 0,
  estado VARCHAR(30) DEFAULT 'APROBADO',
  detalle_liquidacion TEXT NULL,
  observaciones TEXT NULL,
  numero_recibo VARCHAR(64) NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS pres_retanqueos_pkey ON pres_retanqueos (id);
-- Garantiza que el numero de recibo no se repita (verificacion de unicidad)
CREATE UNIQUE INDEX IF NOT EXISTS uq_pres_retanqueos_numero_recibo
  ON pres_retanqueos (numero_recibo)
  WHERE numero_recibo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pres_retanqueos_origen ON pres_retanqueos (id_prestamo_origen);
CREATE INDEX IF NOT EXISTS idx_pres_retanqueos_nuevo ON pres_retanqueos (id_prestamo_nuevo);
CREATE INDEX IF NOT EXISTS idx_pres_retanqueos_asociado ON pres_retanqueos (id_asociado);

COMMENT ON TABLE pres_retanqueos IS 'Traza auditable de las operaciones de retanqueo de creditos';
COMMENT ON COLUMN pres_retanqueos.numero_recibo IS 'Numero de recibo generado para la operacion de retanqueo';
COMMENT ON COLUMN pres_retanqueos.detalle_liquidacion IS 'Detalle JSON de la liquidacion del credito origen';
