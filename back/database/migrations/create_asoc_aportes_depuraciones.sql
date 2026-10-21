BEGIN;

CREATE TABLE IF NOT EXISTS public.asoc_aportes_depuraciones (
    id uuid PRIMARY KEY,
    fecha timestamptz NOT NULL DEFAULT now(),
    id_usuario integer NOT NULL,
    motivo varchar(500) NOT NULL,
    cantidad integer NOT NULL CHECK (cantidad > 0),
    monto_eliminado bigint NOT NULL,
    eliminados jsonb NOT NULL CHECK (jsonb_typeof(eliminados) = 'array'),
    conservados jsonb NOT NULL CHECK (jsonb_typeof(conservados) = 'array'),
    CHECK (jsonb_array_length(eliminados) = cantidad),
    CHECK (jsonb_array_length(conservados) > 0)
);

COMMENT ON TABLE public.asoc_aportes_depuraciones IS
    'Auditoria persistente de depuraciones: conserva snapshots completos sin FK a los aportes eliminados.';

COMMIT;
