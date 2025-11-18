-- Insertar metas para el año 2025 basadas en las metas del 2024

INSERT INTO asoc_metas_ahorro (asociado_id, meta_mensual, año)
SELECT 
    asociado_id,
    meta_mensual, -- Usar la misma meta del 2024
    2025 as año
FROM asoc_metas_ahorro 
WHERE año = 2024
ON CONFLICT (asociado_id, año) DO NOTHING;

-- Verificar el resultado
SELECT COUNT(*) as metas_2025 FROM asoc_metas_ahorro WHERE año = 2025;

-- Ver el total proyectado para 2025
SELECT SUM(meta_mensual * 12) as total_proyectado_2025 FROM asoc_metas_ahorro WHERE año = 2025;