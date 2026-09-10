BEGIN;

UPDATE public.usuarios AS u
SET
  contrasena = '*****',
  fecha_modificacion = NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM public.usuario_roles AS ur
  INNER JOIN public.roles AS r ON r.id = ur.rol_id
  WHERE ur.usuario_id = u.id
    AND UPPER(TRIM(r.nombre)) IN ('ADMINISTRADOR', 'GESTOR DE OPERACIONES')
);

COMMIT;