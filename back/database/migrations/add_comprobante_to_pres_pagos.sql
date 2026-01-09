-- Add comprobante column to pres_pagos table
-- This column will store the filename of the payment voucher/receipt

ALTER TABLE pres_pagos 
ADD COLUMN IF NOT EXISTS comprobante VARCHAR(255) NULL;

-- Add comment to the column
COMMENT ON COLUMN pres_pagos.comprobante IS 'Nombre del archivo de comprobante de pago (JPG, PNG o PDF)';
