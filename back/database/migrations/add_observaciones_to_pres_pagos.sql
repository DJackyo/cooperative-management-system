-- Agregar la columna observaciones a la tabla pres_pagos
-- Esta columna almacenará notas o comentarios sobre el pago del crédito

ALTER TABLE pres_pagos 
ADD COLUMN IF NOT EXISTS observaciones TEXT NULL;

-- Agregar comentario a la columna
COMMENT ON COLUMN pres_pagos.observaciones IS 'Observaciones o notas asociadas al registro del pago del crédito';
