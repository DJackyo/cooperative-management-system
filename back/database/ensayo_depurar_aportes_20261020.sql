-- ENSAYO: ejecutar TODO el archivo en una conexion sin otra transaccion abierta.
-- No sustituir ROLLBACK por COMMIT: este archivo no autoriza una depuracion definitiva.
-- La copia de auditoria tambien se revierte. Exportar sus resultados ANTES del
-- ROLLBACK si se necesita conservar evidencia; no reemplaza un respaldo externo.
-- Si alguna sentencia falla, detener la ejecucion y ejecutar ROLLBACK.
-- Si los datos no coinciden, consultar ensayo_diferencias en los resultados
-- o el campo DETAIL del error. No actualizar el manifiesto sin revisar los cambios.
-- Puede bloquear escrituras brevemente; ejecutar en una ventana sin registros de pagos.
-- Alcance: 88 grupos / 184 registros compartidos y confirmados el 2026-10-20.
-- Se conservan los datos originales del menor ID entre montos iguales.
-- Los metodos TRANSFERENCIA de 2989, 1610 y 1611 se auditan, no se transfieren.

BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

LOCK TABLE public.asoc_aportes_asociados IN SHARE ROW EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class
        WHERE oid = 'public.asoc_aportes_asociados'::regclass
          AND (relkind <> 'r' OR relrowsecurity)
    ) OR EXISTS (
        SELECT 1 FROM pg_inherits
        WHERE inhparent = 'public.asoc_aportes_asociados'::regclass
           OR inhrelid = 'public.asoc_aportes_asociados'::regclass
    ) THEN
        RAISE EXCEPTION 'Revisar particiones, herencia o RLS antes de continuar';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE contype = 'f'
          AND confrelid = 'public.asoc_aportes_asociados'::regclass
    ) THEN
        RAISE EXCEPTION 'Existen claves foraneas hacia aportes: revisar dependencias antes de borrar';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgrelid = 'public.asoc_aportes_asociados'::regclass
          AND NOT tgisinternal AND tgenabled <> 'D'
    ) OR EXISTS (
        SELECT 1 FROM pg_rewrite
        WHERE ev_class = 'public.asoc_aportes_asociados'::regclass
    ) THEN
        RAISE EXCEPTION 'Existen triggers o reglas: revisar sus efectos antes de continuar';
    END IF;
END $$;

CREATE TEMP TABLE ensayo_grupos (
    id_asociado integer NOT NULL,
    periodo date NOT NULL,
    ids integer[] NOT NULL,
    montos integer[] NOT NULL,
    PRIMARY KEY (id_asociado, periodo),
    CHECK (cardinality(ids) = cardinality(montos))
) ON COMMIT DROP;

INSERT INTO ensayo_grupos VALUES
    (28, '2026-04-01', '{2943,2989}', '{50340,50340}'),
    (27, '2026-01-01', '{2998,2999}', '{50000,1}'),
    (21, '2023-03-01', '{96,1615}', '{0,57002}'),
    (27, '2023-03-01', '{160,1627}', '{101635,101635}'),
    (37, '2023-03-01', '{240,1746}', '{0,50000}'),
    (41, '2023-03-01', '{272,1747}', '{18862,18862}'),
    (45, '2023-03-01', '{304,1748}', '{41538,41538}'),
    (47, '2023-03-01', '{320,1749}', '{282840,282840}'),
    (63, '2023-03-01', '{416,1750}', '{72216,72216}'),
    (64, '2023-03-01', '{432,1751}', '{0,49384}'),
    (68, '2023-03-01', '{480,1752}', '{50000,50000}'),
    (77, '2023-03-01', '{528,1753}', '{0,42032}'),
    (86, '2023-03-01', '{624,1754}', '{0,51122}'),
    (91, '2023-03-01', '{656,1755}', '{0,100000}'),
    (113, '2023-03-01', '{736,1556,1756}', '{0,50000,200000}'),
    (114, '2023-03-01', '{752,1757}', '{50000,50000}'),
    (197, '2023-03-01', '{1024,1758}', '{200000,200000}'),
    (214, '2023-03-01', '{1248,1594}', '{50000,50000}'),
    (216, '2023-03-01', '{1280,1639}', '{100000,100000}'),
    (219, '2023-03-01', '{1328,1651}', '{50000,50000}'),
    (227, '2023-03-01', '{1408,1759}', '{50000,50000}'),
    (229, '2023-03-01', '{1424,1760}', '{0,44127}'),
    (232, '2023-03-01', '{1472,1761}', '{104980,104980}'),
    (234, '2023-03-01', '{1488,1762}', '{100000,100000}'),
    (21, '2023-02-01', '{95,1614}', '{56744,56744}'),
    (27, '2023-02-01', '{159,1626}', '{101414,101414}'),
    (28, '2023-02-01', '{175,1725}', '{100253,1}'),
    (32, '2023-02-01', '{191,1726}', '{50000,50000}'),
    (37, '2023-02-01', '{239,1727}', '{1,50000}'),
    (41, '2023-02-01', '{271,1728}', '{18602,18602}'),
    (45, '2023-02-01', '{303,1729}', '{50000,50000}'),
    (47, '2023-02-01', '{319,1730}', '{232655,232655}'),
    (63, '2023-02-01', '{415,1731}', '{50000,50000}'),
    (64, '2023-02-01', '{431,1732}', '{49210,49210}'),
    (68, '2023-02-01', '{479,1733}', '{50000,50000}'),
    (77, '2023-02-01', '{527,1734}', '{0,598}'),
    (86, '2023-02-01', '{623,1735}', '{50710,50710}'),
    (91, '2023-02-01', '{655,1736}', '{100000,100000}'),
    (94, '2023-02-01', '{687,1611}', '{50000,50000}'),
    (111, '2023-02-01', '{703,1737}', '{50000,50000}'),
    (113, '2023-02-01', '{735,1738}', '{302000,302000}'),
    (114, '2023-02-01', '{751,1739}', '{50000,50000}'),
    (202, '2023-02-01', '{1103,1740}', '{150000,150000}'),
    (212, '2023-02-01', '{1215,1741}', '{100000,100000}'),
    (214, '2023-02-01', '{1247,1593}', '{50000,50000}'),
    (216, '2023-02-01', '{1279,1638}', '{100000,100000}'),
    (219, '2023-02-01', '{1327,1650}', '{50000,50000}'),
    (227, '2023-02-01', '{1407,1742}', '{100000,100000}'),
    (229, '2023-02-01', '{1423,1743}', '{51837,51837}'),
    (232, '2023-02-01', '{1471,1744}', '{94897,94897}'),
    (234, '2023-02-01', '{1487,1745}', '{50000,50000}'),
    (21, '2023-01-01', '{94,1613}', '{36906,36906}'),
    (27, '2023-01-01', '{158,1625}', '{101196,101196}'),
    (28, '2023-01-01', '{174,1683}', '{100000,1}'),
    (32, '2023-01-01', '{190,1684}', '{300000,300000}'),
    (37, '2023-01-01', '{238,1685}', '{51587,1}'),
    (41, '2023-01-01', '{270,1686}', '{18346,18346}'),
    (45, '2023-01-01', '{302,1687}', '{51345,51345}'),
    (47, '2023-01-01', '{318,1688}', '{282473,282473}'),
    (63, '2023-01-01', '{414,1584,1689}', '{50000,50000,50000}'),
    (64, '2023-01-01', '{430,1690}', '{48568,48568}'),
    (68, '2023-01-01', '{478,1585,1691}', '{50000,50000,50000}'),
    (72, '2023-01-01', '{494,1586,1692}', '{50000,50000,50000}'),
    (86, '2023-01-01', '{622,1693}', '{44237,44237}'),
    (91, '2023-01-01', '{654,1694}', '{100000,100000}'),
    (94, '2023-01-01', '{686,1587,1610}', '{50000,50000,50000}'),
    (111, '2023-01-01', '{702,1695}', '{48902,48902}'),
    (113, '2023-01-01', '{734,1696}', '{0,227775}'),
    (114, '2023-01-01', '{750,1697}', '{62000,62000}'),
    (197, '2023-01-01', '{1022,1698}', '{450000,450000}'),
    (202, '2023-01-01', '{1102,1699}', '{100000,100000}'),
    (212, '2023-01-01', '{1214,1700}', '{100000,100000}'),
    (214, '2023-01-01', '{1246,1588,1592}', '{50000,50000,50000}'),
    (216, '2023-01-01', '{1278,1637}', '{100000,100000}'),
    (219, '2023-01-01', '{1326,1589,1649}', '{50000,50000,50000}'),
    (227, '2023-01-01', '{1406,1590,1701}', '{50000,50000,50000}'),
    (229, '2023-01-01', '{1422,1702}', '{50579,50579}'),
    (232, '2023-01-01', '{1470,1703}', '{94815,94815}'),
    (234, '2023-01-01', '{1486,1704}', '{100000,100000}'),
    (94, '2022-12-01', '{685,1609}', '{0,50000}'),
    (214, '2022-12-01', '{1245,1591}', '{50000,50000}'),
    (94, '2022-08-01', '{681,1305}', '{0,0}'),
    (13, '2022-06-01', '{7,39}', '{0,94852}'),
    (13, '2022-05-01', '{6,38}', '{0,98735}'),
    (13, '2022-04-01', '{5,37}', '{0,98356}'),
    (13, '2022-03-01', '{4,36}', '{0,97982}'),
    (13, '2021-12-01', '{1,33}', '{23191,15736508}'),
    (220, '2021-12-01', '{17,1329}', '{1649767,2675000}');

CREATE TEMP TABLE ensayo_esperados ON COMMIT DROP AS
SELECT g.id_asociado, g.periodo, r.id, r.monto
FROM ensayo_grupos g
CROSS JOIN LATERAL unnest(g.ids, g.montos) AS r(id, monto);
ALTER TABLE ensayo_esperados ADD PRIMARY KEY (id);

CREATE TEMP TABLE ensayo_candidatos (
    id integer PRIMARY KEY REFERENCES ensayo_esperados(id),
    motivo text NOT NULL
) ON COMMIT DROP;

INSERT INTO ensayo_candidatos
SELECT id, 'MONTO_DUPLICADO'
FROM unnest(ARRAY[
    2989,1627,1747,1748,1749,1750,1752,1757,1758,1594,1639,1651,
    1759,1761,1762,1614,1626,1726,1728,1729,1730,1731,1732,1733,
    1735,1736,1611,1737,1738,1739,1740,1741,1593,1638,1650,1742,
    1743,1744,1745,1613,1625,1684,1686,1687,1688,1584,1689,1690,
    1585,1691,1586,1692,1693,1694,1587,1610,1695,1697,1698,1699,
    1700,1588,1592,1637,1589,1649,1590,1701,1702,1703,1704,1591
]) AS ids(id);

INSERT INTO ensayo_candidatos
SELECT id, 'CERO_CON_PAGO'
FROM unnest(ARRAY[96,240,432,528,624,656,736,1424,527,734,685,7,6,5,4]) AS ids(id);
INSERT INTO ensayo_candidatos VALUES (1305, 'CERO_DUPLICADO');
INSERT INTO ensayo_candidatos
SELECT id, 'VALOR_UNO_ERRONEO'
FROM unnest(ARRAY[2999,1725,239,1683,1685]) AS ids(id);

CREATE TEMP TABLE ensayo_diferencias ON COMMIT DROP AS
SELECT g.id_asociado, g.periodo,
       g.ids AS ids_esperados,
       COALESCE(array_agg(a.id ORDER BY a.id) FILTER (WHERE a.id IS NOT NULL),
                ARRAY[]::integer[]) AS ids_actuales,
       g.montos AS montos_esperados,
       COALESCE(array_agg(a.monto ORDER BY a.id) FILTER (WHERE a.id IS NOT NULL),
                ARRAY[]::integer[]) AS montos_actuales
FROM ensayo_grupos g
LEFT JOIN public.asoc_aportes_asociados a
  ON a.id_asociado = g.id_asociado
 AND a.fecha_aporte >= g.periodo
 AND a.fecha_aporte < g.periodo + INTERVAL '1 month'
GROUP BY g.id_asociado, g.periodo, g.ids, g.montos
HAVING array_agg(a.id ORDER BY a.id) IS DISTINCT FROM g.ids
    OR array_agg(a.monto ORDER BY a.id) IS DISTINCT FROM g.montos;

-- Cero filas significa que los 88 grupos coinciden con los datos revisados.
SELECT * FROM ensayo_diferencias ORDER BY periodo DESC, id_asociado;

DO $$
BEGIN
    IF (SELECT count(*) FROM ensayo_grupos) <> 88
       OR (SELECT count(*) FROM ensayo_esperados) <> 184
       OR (SELECT sum(monto) FROM ensayo_esperados) IS DISTINCT FROM 33737970::bigint
       OR (SELECT count(*) FROM ensayo_candidatos) <> 93
       OR (SELECT sum(e.monto) FROM ensayo_esperados e
           JOIN ensayo_candidatos c USING (id)) IS DISTINCT FROM 6169852::bigint THEN
        RAISE EXCEPTION 'El manifiesto no coincide con la propuesta aprobada';
    END IF;

    IF EXISTS (SELECT 1 FROM ensayo_diferencias) THEN
        RAISE EXCEPTION 'Cambiaron IDs, asociados, periodos o montos; regenerar la vista previa'
            USING DETAIL = (
                SELECT jsonb_pretty(jsonb_agg(to_jsonb(d) ORDER BY d.periodo DESC, d.id_asociado))
                FROM ensayo_diferencias d
            ),
            HINT = 'Comparar los valores esperados y actuales del DETAIL o del resultado ensayo_diferencias. No omitir esta validacion.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.asoc_aportes_asociados a
        JOIN ensayo_candidatos c USING (id)
        WHERE a.tipo_aporte IS DISTINCT FROM 'MENSUAL'
           OR a.estado IS DISTINCT FROM true
           OR NULLIF(btrim(a.comprobante), '') IS NOT NULL
           OR (NULLIF(btrim(a.observaciones), '') IS NOT NULL
               AND NOT (a.monto = 0 AND btrim(a.observaciones) = 'No registra pago'))
    ) THEN
        RAISE EXCEPTION 'Hay estado, tipo, comprobantes u observaciones que requieren revision';
    END IF;
END $$;

CREATE TEMP TABLE ensayo_totales_antes ON COMMIT DROP AS
SELECT count(*) AS cantidad, COALESCE(sum(monto), 0) AS monto
FROM public.asoc_aportes_asociados;

-- Sin IF NOT EXISTS: nunca reutilizar ni sobrescribir una auditoria previa.
CREATE TABLE public.auditoria_ensayo_aportes_20261020 (
    id integer PRIMARY KEY,
    id_asociado integer NOT NULL,
    periodo date NOT NULL,
    accion text NOT NULL,
    motivo text,
    registrado_en timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    transaccion bigint NOT NULL DEFAULT txid_current(),
    registro jsonb NOT NULL
);

INSERT INTO public.auditoria_ensayo_aportes_20261020
    (id, id_asociado, periodo, accion, motivo, registro)
SELECT a.id, e.id_asociado, e.periodo,
       CASE WHEN c.id IS NOT NULL THEN 'ELIMINAR_EN_ENSAYO'
            WHEN (e.id_asociado, e.periodo) IN (
                (113, DATE '2023-03-01'),
                (13, DATE '2021-12-01'),
                (220, DATE '2021-12-01')
            ) THEN 'CONSERVAR_PENDIENTE_REVISION'
            ELSE 'CONSERVAR' END,
       c.motivo, to_jsonb(a)
FROM public.asoc_aportes_asociados a
JOIN ensayo_esperados e USING (id)
LEFT JOIN ensayo_candidatos c USING (id);

-- Resultado exportable: copia completa de los 184 registros, incluida su metadata.
SELECT * FROM public.auditoria_ensayo_aportes_20261020
ORDER BY id_asociado, periodo, id;

-- Comparacion de metodos: informativa, no modifica el registro conservado.
SELECT a.id AS id_candidato, a.metodo_pago AS metodo_candidato,
       k.id AS id_conservado, k.metodo_pago AS metodo_conservado
FROM (VALUES (2989, 2943), (1610, 686), (1611, 687)) AS p(borrar, conservar)
JOIN public.asoc_aportes_asociados a ON a.id = p.borrar
JOIN public.asoc_aportes_asociados k ON k.id = p.conservar;

CREATE TEMP TABLE ensayo_eliminados ON COMMIT DROP AS
WITH eliminados AS (
    DELETE FROM public.asoc_aportes_asociados a
    USING ensayo_candidatos c, ensayo_esperados e
    WHERE a.id = c.id AND e.id = a.id
      AND a.id_asociado = e.id_asociado AND a.monto = e.monto
      AND a.fecha_aporte >= e.periodo
      AND a.fecha_aporte < e.periodo + INTERVAL '1 month'
    RETURNING a.*
)
SELECT * FROM eliminados;

DO $$
BEGIN
    IF (SELECT count(*) FROM ensayo_eliminados) <> 93
       OR (SELECT sum(monto) FROM ensayo_eliminados) IS DISTINCT FROM 6169852::bigint
       OR (SELECT count(*) FROM public.auditoria_ensayo_aportes_20261020) <> 184 THEN
        RAISE EXCEPTION 'La eliminacion o la auditoria no coincide con lo esperado';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.auditoria_ensayo_aportes_20261020 b
        LEFT JOIN public.asoc_aportes_asociados a USING (id)
        WHERE (b.accion = 'ELIMINAR_EN_ENSAYO' AND a.id IS NOT NULL)
           OR (b.accion <> 'ELIMINAR_EN_ENSAYO'
               AND to_jsonb(a) IS DISTINCT FROM b.registro)
    ) THEN
        RAISE EXCEPTION 'Se alteraron registros que debian conservarse o quedaron candidatos sin borrar';
    END IF;

    IF (SELECT count(*) FROM public.asoc_aportes_asociados)
           <> (SELECT cantidad - 93 FROM ensayo_totales_antes)
       OR (SELECT COALESCE(sum(monto), 0) FROM public.asoc_aportes_asociados)
           IS DISTINCT FROM (SELECT monto - 6169852 FROM ensayo_totales_antes) THEN
        RAISE EXCEPTION 'Los totales globales no coinciden con el efecto previsto';
    END IF;
END $$;

SELECT c.motivo, count(*) AS registros_eliminados, sum(a.monto) AS reduccion
FROM ensayo_eliminados a
JOIN ensayo_candidatos c USING (id)
GROUP BY c.motivo
ORDER BY c.motivo;

SELECT 184 AS registros_antes,
       (SELECT count(*) FROM ensayo_eliminados) AS eliminados,
       (SELECT count(*) FROM public.asoc_aportes_asociados a
        JOIN ensayo_esperados e USING (id)) AS registros_despues,
       (SELECT sum(monto) FROM ensayo_eliminados) AS reduccion,
       (SELECT sum(a.monto) FROM public.asoc_aportes_asociados a
        JOIN ensayo_esperados e USING (id)) AS saldo_despues;

-- Deben quedar SOLO los tres casos pendientes dentro de los grupos revisados.
SELECT a.id_asociado, g.periodo, array_agg(a.id ORDER BY a.id) AS ids,
       array_agg(a.monto ORDER BY a.id) AS montos
FROM public.asoc_aportes_asociados a
JOIN ensayo_grupos g ON a.id_asociado = g.id_asociado
 AND a.fecha_aporte >= g.periodo
 AND a.fecha_aporte < g.periodo + INTERVAL '1 month'
GROUP BY a.id_asociado, g.periodo
HAVING count(*) > 1
ORDER BY g.periodo DESC, a.id_asociado;

ROLLBACK;

SELECT 'Transaccion revertida. Revise los errores y resumen anteriores: este mensaje no confirma que las validaciones pasaron.' AS resultado;
