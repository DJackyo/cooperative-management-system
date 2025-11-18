-- Script para insertar metas para TODOS los asociados activos

-- Insertar metas para todos los asociados activos que no tienen meta aún
INSERT INTO asoc_metas_ahorro (asociado_id, meta_mensual, año)
SELECT 
    asoc.id,
    COALESCE(
        -- Si tiene historial de aportes, usar promedio
        ROUND(
            (SELECT AVG(monto) 
             FROM asoc_aportes_asociados 
             WHERE id_asociado = asoc.id 
             AND monto > 0
            ), 0
        ),
        -- Si no tiene historial, usar meta básica
        50000
    ) as meta_mensual,
    EXTRACT(YEAR FROM CURRENT_DATE) as año
FROM asociados asoc
WHERE asoc.id_estado = 1  -- Solo asociados activos
AND NOT EXISTS (
    SELECT 1 FROM asoc_metas_ahorro 
    WHERE asociado_id = asoc.id 
    AND año = EXTRACT(YEAR FROM CURRENT_DATE)
);

-- Verificar el resultado
SELECT 
    COUNT(*) as total_metas,
    SUM(meta_mensual * 12) as proyeccion_anual
FROM asoc_metas_ahorro 
WHERE año = EXTRACT(YEAR FROM CURRENT_DATE);

-- Verificar cuántos asociados activos hay vs cuántas metas
SELECT 
    (SELECT COUNT(*) FROM asociados WHERE id_estado = 1) as asociados_activos,
    (SELECT COUNT(*) FROM asoc_metas_ahorro WHERE año = EXTRACT(YEAR FROM CURRENT_DATE)) as metas_registradas;