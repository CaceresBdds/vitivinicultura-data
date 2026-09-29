-- Pregunta:
-- ¿Cómo se comportó la producción de uva en 2025 respecto de los años anteriores?
--
-- Objetivo:
-- Comparar la producción total de 2025 con la de 2024 y con el promedio
-- histórico del período 2012-2024, y determinar qué posición ocupa 2025
-- dentro de la serie completa 2012-2025.
--
-- Lógica:
-- 1. Utiliza la vista vw_produccion_nacional_anual, donde la producción
--    ya se encuentra agregada por año.
-- 2. Obtiene la producción de 2025 y 2024 mediante FILTER.
-- 3. Calcula el promedio anual de producción para 2012-2024.
-- 4. Calcula la variación porcentual de 2025 respecto de 2024.
-- 5. Calcula la variación porcentual de 2025 respecto del promedio 2012-2024.
-- 6. En una segunda consulta, utiliza DENSE_RANK() para ordenar todos los años
--    de mayor a menor producción total y determinar la posición de 2025.
--
-- Consideraciones:
-- Este análisis utiliza únicamente producción porque el dataset de superficie
-- implantada finaliza en 2024.
-- Por lo tanto, no se calcula para 2025 ninguna comparación entre producción
-- y superficie.
-- El promedio histórico utiliza 2012-2024 y excluye 2025 para que el propio
-- año analizado no influya en la referencia contra la que se lo compara.
-- NULLIF() evita una división por cero en las comparaciones porcentuales.
-- Los registros marcados como duplicado_exacto se conservan porque durante
-- el profiling no se obtuvo evidencia suficiente para eliminarlos.


-- Comparación de la producción de 2025 con 2024 y con el promedio 2012-2024

WITH resumen AS (
    SELECT
        MAX(produccion_total)
            FILTER (WHERE anio = 2025) AS produccion_2025,

        MAX(produccion_total)
            FILTER (WHERE anio = 2024) AS produccion_2024,

        AVG(produccion_total)
            FILTER (WHERE anio BETWEEN 2012 AND 2024) AS promedio_2012_2024

    FROM vw_produccion_nacional_anual
    WHERE anio BETWEEN 2012 AND 2025
)
SELECT
    produccion_2025,
    produccion_2024,

    ROUND(
        (produccion_2025 - produccion_2024)
        / NULLIF(produccion_2024, 0) * 100,
        2
    ) AS variacion_vs_2024_pct,

    ROUND(promedio_2012_2024, 2) AS promedio_2012_2024,

    ROUND(
        (produccion_2025 - promedio_2012_2024)
        / NULLIF(promedio_2012_2024, 0) * 100,
        2
    ) AS variacion_vs_promedio_pct

FROM resumen;


-- Posición de cada año según su producción total

SELECT
    anio,
    produccion_total,

    DENSE_RANK() OVER (
        ORDER BY produccion_total DESC
    ) AS posicion

FROM vw_produccion_nacional_anual

WHERE anio BETWEEN 2012 AND 2025

ORDER BY posicion;