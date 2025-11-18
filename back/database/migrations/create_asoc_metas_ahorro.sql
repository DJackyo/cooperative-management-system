-- Crear tabla para metas de ahorro de asociados
CREATE TABLE asoc_metas_ahorro (
    id SERIAL PRIMARY KEY,
    asociado_id INTEGER NOT NULL,
    meta_mensual DECIMAL(15,2) NOT NULL,
    año INTEGER NOT NULL,
    activa BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT FK_asoc_metas_ahorro_asociado 
        FOREIGN KEY (asociado_id) REFERENCES asociados(id),
    
    CONSTRAINT UQ_asoc_metas_ahorro_asociado_año 
        UNIQUE (asociado_id, año)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IX_asoc_metas_ahorro_año ON asoc_metas_ahorro(año);
CREATE INDEX IX_asoc_metas_ahorro_activa ON asoc_metas_ahorro(activa);

-- Insertar metas basadas en el promedio histórico de aportes de cada asociado ACTIVO
INSERT INTO asoc_metas_ahorro (asociado_id, meta_mensual, año) 
SELECT 
    a.id_asociado,
    COALESCE(
        -- Calcular promedio mensual del año anterior
        ROUND(
            (SELECT AVG(monto) 
             FROM asoc_aportes_asociados 
             WHERE id_asociado = a.id_asociado 
             AND EXTRACT(YEAR FROM fecha_aporte) = EXTRACT(YEAR FROM CURRENT_DATE) - 1
             AND monto > 0
            ), 0
        ),
        -- Si no hay datos del año anterior, usar promedio general del asociado
        ROUND(
            (SELECT AVG(monto) 
             FROM asoc_aportes_asociados 
             WHERE id_asociado = a.id_asociado 
             AND monto > 0
            ), 0
        ),
        -- Si no tiene historial, usar meta mínima
        50000
    ) as meta_mensual,
    EXTRACT(YEAR FROM CURRENT_DATE) as año
FROM (
    SELECT DISTINCT aportes.id_asociado 
    FROM asoc_aportes_asociados aportes
    INNER JOIN asociados asoc ON asoc.id = aportes.id_asociado
    WHERE aportes.monto > 0 
    AND asoc.id_estado = 1  -- Solo asociados activos
) a
WHERE NOT EXISTS (
    SELECT 1 FROM asoc_metas_ahorro 
    WHERE asociado_id = a.id_asociado 
    AND año = EXTRACT(YEAR FROM CURRENT_DATE)
);

-- Insertar metas para asociados activos sin historial de aportes
INSERT INTO asoc_metas_ahorro (asociado_id, meta_mensual, año)
SELECT 
    id,
    50000 as meta_mensual, -- Meta básica para nuevos asociados
    EXTRACT(YEAR FROM CURRENT_DATE) as año
FROM asociados
WHERE id_estado = 1  -- Solo asociados activos
AND id NOT IN (
    SELECT DISTINCT id_asociado 
    FROM asoc_aportes_asociados 
    WHERE monto > 0
)
AND NOT EXISTS (
    SELECT 1 FROM asoc_metas_ahorro 
    WHERE asociado_id = asociados.id 
    AND año = EXTRACT(YEAR FROM CURRENT_DATE)
);