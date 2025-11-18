-- Script para corregir la tabla asoc_metas_ahorro
-- Eliminar metas de asociados inactivos

DELETE FROM asoc_metas_ahorro 
WHERE asociado_id IN (
    SELECT id FROM asociados WHERE id_estado != 1
);

-- Verificar cuántos registros quedan
SELECT COUNT(*) as total_metas_activas FROM asoc_metas_ahorro;

-- Ver el total proyectado después de la limpieza
SELECT SUM(meta_mensual * 12) as total_anual_proyectado 
FROM asoc_metas_ahorro 
WHERE año = EXTRACT(YEAR FROM CURRENT_DATE) 
AND activa = true;