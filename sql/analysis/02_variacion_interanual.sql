-- Pregunta:
-- ¿Cómo varió interanualmente la superficie implantada y la producción
-- de uva entre 2012 y 2024?
--
-- Objetivo:
-- Calcular el porcentaje de variación de la superficie y la producción
-- respecto del año inmediatamente anterior.
--
-- Lógica:
-- 1. Utiliza las vistas nacionales anuales, donde superficie y producción
--    ya se encuentran agregadas por año.
-- 2. Une ambas series mediante el año para trabajar sobre el período común.
-- 3. Utiliza LAG() para obtener el valor del año inmediatamente anterior.
-- 4. Calcula la variación porcentual interanual de ambas métricas.
--
-- Consideraciones:
-- El año 2012 devuelve NULL en las columnas de variación porque no existe
-- información de 2011 dentro del período analizado con la cual compararlo.
-- La vista de superficie nacional conserva también los registros con
-- geografía incompleta, ya que forman parte del total nacional.
-- El análisis se limita a 2012-2024 porque es el período común disponible
-- para superficie y producción.

WITH totales_anuales AS (
    SELECT
        s.anio,
        s.superficie_total,
        p.produccion_total
    FROM vw_superficie_nacional_anual s
    JOIN vw_produccion_nacional_anual p
        ON s.anio = p.anio
    WHERE s.anio BETWEEN 2012 AND 2024
)
SELECT
    anio,
    superficie_total,
    produccion_total,

    ROUND(
        (
            superficie_total
            - LAG(superficie_total) OVER (ORDER BY anio)
        )
        / LAG(superficie_total) OVER (ORDER BY anio)
        * 100,
        2
    ) AS variacion_superficie_pct,

    ROUND(
        (
            produccion_total
            - LAG(produccion_total) OVER (ORDER BY anio)
        )
        / LAG(produccion_total) OVER (ORDER BY anio)
        * 100,
        2
    ) AS variacion_produccion_pct

FROM totales_anuales
ORDER BY anio;