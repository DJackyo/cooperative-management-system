-- Script simple para insertar TODOS los asociados activos

-- Primero, verificar cuántos asociados activos hay
SELECT COUNT(*) as asociados_activos FROM asociados WHERE id_estado = 1;

-- Insertar meta básica para TODOS los asociados activos
INSERT INTO asoc_metas_ahorro (asociado_id, meta_mensual, año)
SELECT 
    id as asociado_id,
    50000 as meta_mensual,
    2024 as año
FROM asociados 
WHERE id_estado = 1
ON CONFLICT (asociado_id, año) DO NOTHING;

-- Verificar el resultado
SELECT COUNT(*) as metas_insertadas FROM asoc_metas_ahorro WHERE año = 2024;

-- Ver el total proyectado
SELECT SUM(meta_mensual * 12) as total_proyectado FROM asoc_metas_ahorro WHERE año = 2024;