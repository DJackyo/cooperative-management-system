ALTER TABLE public.retiros_asociados
  ADD COLUMN IF NOT EXISTS motivo TEXT,
  ADD COLUMN IF NOT EXISTS adjunto TEXT,
  ADD COLUMN IF NOT EXISTS estado_solicitud VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;

CREATE INDEX IF NOT EXISTS idx_retiros_asociados_estado_solicitud
  ON public.retiros_asociados(estado_solicitud);