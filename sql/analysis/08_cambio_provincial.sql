-- Pregunta:
-- ¿Qué provincias aumentaron o redujeron más su superficie implantada
-- y su producción de uva entre 2012 y 2024?
--
-- Objetivo:
-- Comparar el primer y el último año del período común para medir, por provincia,
-- el cambio absoluto y porcentual tanto de superficie implantada como de producción.
--
-- Lógica:
-- 1. Utiliza las vistas provinciales anuales, donde superficie y producción
--    ya se encuentran agregadas por año y provincia.
-- 2. Obtiene mediante FILTER los valores correspondientes a 2012 y 2024.
-- 3. Calcula el cambio absoluto:
--    valor_2024 - valor_2012.
-- 4. Calcula el cambio porcentual:
--    (valor_2024 - valor_2012) / valor_2012 * 100.
-- 5. Ordena de mayor a menor cambio porcentual.
--
-- Consideraciones:
-- Se comparan únicamente provincias que tienen datos tanto en 2012 como en 2024.
-- La ausencia de una provincia en alguno de los años no se interpreta como valor 0.
-- La vista de superficie provincial ya excluye los registros con provincia NULL.
-- NULLIF() evita una división por cero en caso de que el valor inicial sea 0.
-- La comparación entre 2012 y 2024 muestra el cambio entre los extremos del período,
-- pero no describe la evolución ocurrida durante los años intermedios.


-- Cambio de superficie implantada por provincia: 2012 vs 2024

WITH superficie_extremos AS (
    SELECT
        provincia_id,
        provincia,

        MAX(superficie_total)
            FILTER (WHERE anio = 2012) AS superficie_2012,

        MAX(superficie_total)
            FILTER (WHERE anio = 2024) AS superficie_2024

    FROM vw_superficie_provincial_anual
    WHERE anio IN (2012, 2024)
    GROUP BY
        provincia_id,
        provincia
)
SELECT
    provincia,
    superficie_2012,
    superficie_2024,

    superficie_2024 - superficie_2012 AS cambio_absoluto,

    ROUND(
        (superficie_2024 - superficie_2012)
        / NULLIF(superficie_2012, 0) * 100,
        2
    ) AS cambio_pct

FROM superficie_extremos
WHERE superficie_2012 IS NOT NULL
  AND superficie_2024 IS NOT NULL
ORDER BY cambio_pct DESC;


-- Cambio de producción de uva por provincia: 2012 vs 2024

WITH produccion_extremos AS (
    SELECT
        provincia_id,
        provincia,

        MAX(produccion_total)
            FILTER (WHERE anio = 2012) AS produccion_2012,

        MAX(produccion_total)
            FILTER (WHERE anio = 2024) AS produccion_2024

    FROM vw_produccion_provincial_anual
    WHERE anio IN (2012, 2024)
    GROUP BY
        provincia_id,
        provincia
)
SELECT
    provincia,
    produccion_2012,
    produccion_2024,

    produccion_2024 - produccion_2012 AS cambio_absoluto,

    ROUND(
        (produccion_2024 - produccion_2012)
        / NULLIF(produccion_2012, 0) * 100,
        2
    ) AS cambio_pct

FROM produccion_extremos
WHERE produccion_2012 IS NOT NULL
  AND produccion_2024 IS NOT NULL
ORDER BY cambio_pct DESC;