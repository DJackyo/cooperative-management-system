-- Sincronizar la secuencia de la tabla pres_pagos con el ID máximo actual
-- Esto corrige el error "llave duplicada viola restricción de unicidad «pagos_pkey»"
SELECT setval(
  pg_get_serial_sequence('pres_pagos', 'id_pago'),
  COALESCE((SELECT MAX(id_pago) FROM pres_pagos), 1)
);
