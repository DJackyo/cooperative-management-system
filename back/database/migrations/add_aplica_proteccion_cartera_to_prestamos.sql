-- Add aplica_proteccion_cartera column to prestamos table
ALTER TABLE prestamos 
ADD COLUMN IF NOT EXISTS aplica_proteccion_cartera BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN prestamos.aplica_proteccion_cartera IS 'Indica si el crédito aplica protección de cartera (true/false)';
