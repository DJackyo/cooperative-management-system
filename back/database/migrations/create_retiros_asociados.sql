CREATE TABLE IF NOT EXISTS public.retiros_asociados (
  id SERIAL PRIMARY KEY,
  id_asociado INTEGER NOT NULL REFERENCES public.asociados(id),
  fecha_solicitud TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_retiro TIMESTAMP WITHOUT TIME ZONE,
  total_aportes NUMERIC(14, 2) NOT NULL DEFAULT 0,
  saldo_creditos NUMERIC(14, 2) NOT NULL DEFAULT 0,
  saldo_neto NUMERIC(14, 2) NOT NULL DEFAULT 0,
  estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  observaciones TEXT,
  id_usuario_registro INTEGER,
  fecha_liquidacion TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_retiros_asociados_asociado ON public.retiros_asociados(id_asociado);
CREATE INDEX IF NOT EXISTS idx_retiros_asociados_estado ON public.retiros_asociados(estado);