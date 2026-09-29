-- Pregunta:
-- ¿Cuál fue el cambio acumulado de la superficie implantada y de la producción
-- de uva entre 2012 y 2024?
--
-- Objetivo:
-- Comparar el primer y el último año del período común de ambos datasets
-- para conocer cuánto aumentaron o disminuyeron porcentualmente la superficie
-- total implantada y la producción total de uva.
--
-- Lógica:
-- 1. Utiliza las vistas nacionales anuales, donde superficie y producción
--    ya se encuentran agregadas por año.
-- 2. Une ambas series mediante el año.
-- 3. Conserva únicamente los años 2012 y 2024.
-- 4. Utiliza FILTER para obtener por separado los valores de ambos años.
-- 5. Calcula el cambio porcentual acumulado mediante:
--    (valor_2024 - valor_2012) / valor_2012 * 100.
--
-- Consideraciones:
-- La vista de superficie nacional conserva también los registros con
-- geografía incompleta porque forman parte del total nacional.
-- Esta consulta compara exclusivamente los extremos del período y no describe
-- lo ocurrido durante los años intermedios.

WITH totales AS (
    SELECT
        s.anio,
        s.superficie_total,
        p.produccion_total
    FROM vw_superficie_nacional_anual s
    JOIN vw_produccion_nacional_anual p
        ON s.anio = p.anio
    WHERE s.anio IN (2012, 2024)
)
SELECT
    ROUND(
        (
            MAX(superficie_total) FILTER (WHERE anio = 2024)
            - MAX(superficie_total) FILTER (WHERE anio = 2012)
        )
        /
        MAX(superficie_total) FILTER (WHERE anio = 2012)
        * 100,
        2
    ) AS cambio_superficie_pct,

    ROUND(
        (
            MAX(produccion_total) FILTER (WHERE anio = 2024)
            - MAX(produccion_total) FILTER (WHERE anio = 2012)
        )
        /
        MAX(produccion_total) FILTER (WHERE anio = 2012)
        * 100,
        2
    ) AS cambio_produccion_pct
FROM totales;