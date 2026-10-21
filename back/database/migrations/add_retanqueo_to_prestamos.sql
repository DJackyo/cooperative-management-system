-- Migración para soporte de retanqueo de créditos
ALTER TABLE prestamos 
ADD COLUMN IF NOT EXISTS es_retanqueo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS id_prestamo_origen INTEGER REFERENCES prestamos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS saldo_retanqueo NUMERIC DEFAULT 0;

COMMENT ON COLUMN prestamos.es_retanqueo IS 'Indica si el crédito fue originado como un retanqueo de otro crédito';
COMMENT ON COLUMN prestamos.id_prestamo_origen IS 'Identificador del crédito anterior que fue liquidado mediante este retanqueo';
COMMENT ON COLUMN prestamos.saldo_retanqueo IS 'Monto del saldo de capital/liquidación que fue absorbido del crédito anterior';

