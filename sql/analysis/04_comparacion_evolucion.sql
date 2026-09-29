-- Pregunta:
-- ¿La superficie implantada y la producción de uva evolucionaron
-- en la misma dirección año a año entre 2012 y 2024?
--
-- Objetivo:
-- Comparar el comportamiento interanual de ambas métricas para identificar
-- si aumentan juntas, disminuyen juntas o se mueven en direcciones opuestas.
--
-- Lógica:
-- 1. Utiliza las vistas nacionales anuales, donde superficie y producción
--    ya se encuentran agregadas por año.
-- 2. Une ambas series mediante el año para trabajar sobre el período común.
-- 3. Utiliza LAG() para calcular la variación porcentual interanual
--    de superficie y producción.
-- 4. Utiliza CASE para clasificar el comportamiento de cada año como:
--    - Ambas aumentan
--    - Ambas disminuyen
--    - Dirección opuesta
--    - Sin cambio en una o ambas
--    - Sin comparación
--
-- Consideraciones:
-- El año 2012 se clasifica como "Sin comparación" porque no existe un
-- año anterior dentro del período analizado.
-- La clasificación describe únicamente la dirección del cambio y no implica
-- una relación causal entre superficie y producción.
-- La vista de superficie nacional conserva también los registros con
-- geografía incompleta porque forman parte del total nacional.
-- El análisis se limita a 2012-2024 porque es el período común disponible
-- para superficie y producción.

WITH totales AS (
    SELECT
        s.anio,
        s.superficie_total,
        p.produccion_total
    FROM vw_superficie_nacional_anual s
    JOIN vw_produccion_nacional_anual p
        ON s.anio = p.anio
    WHERE s.anio BETWEEN 2012 AND 2024
),
variaciones AS (
    SELECT
        anio,

        (
            superficie_total
            - LAG(superficie_total) OVER (ORDER BY anio)
        )
        / LAG(superficie_total) OVER (ORDER BY anio)
        * 100 AS variacion_superficie_pct,

        (
            produccion_total
            - LAG(produccion_total) OVER (ORDER BY anio)
        )
        / LAG(produccion_total) OVER (ORDER BY anio)
        * 100 AS variacion_produccion_pct

    FROM totales
)
SELECT
    anio,
    ROUND(variacion_superficie_pct, 2) AS variacion_superficie_pct,
    ROUND(variacion_produccion_pct, 2) AS variacion_produccion_pct,

    CASE
        WHEN variacion_superficie_pct IS NULL
          OR variacion_produccion_pct IS NULL
            THEN 'Sin comparación'

        WHEN variacion_superficie_pct > 0
         AND variacion_produccion_pct > 0
            THEN 'Ambas aumentan'

        WHEN variacion_superficie_pct < 0
         AND variacion_produccion_pct < 0
            THEN 'Ambas disminuyen'

        WHEN (
                variacion_superficie_pct > 0
            AND variacion_produccion_pct < 0
        )
        OR (
                variacion_superficie_pct < 0
            AND variacion_produccion_pct > 0
        )
            THEN 'Dirección opuesta'

        ELSE 'Sin cambio en una o ambas'
    END AS comportamiento

FROM variaciones
ORDER BY anio;