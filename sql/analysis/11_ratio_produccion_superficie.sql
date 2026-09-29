-- Pregunta:
-- ¿Cuál es la relación entre la producción de uva y la superficie implantada
-- a nivel nacional y provincial entre 2012 y 2024?
--
-- Objetivo:
-- Calcular un ratio agregado de producción sobre superficie expresado en
-- quintales por hectárea, primero para el total nacional y luego por provincia.
--
-- Lógica:
-- 1. Para el análisis nacional:
--    - utiliza las vistas nacionales anuales;
--    - une superficie y producción mediante el año;
--    - calcula producción_total / superficie_total.
-- 2. Para el análisis provincial:
--    - utiliza las vistas provinciales anuales;
--    - une ambas métricas mediante año + provincia_id;
--    - calcula el mismo ratio para cada provincia.
--
-- Consideraciones:
-- El indicador se interpreta como un ratio agregado de producción/superficie.
-- No se asume automáticamente que represente un rendimiento agronómico exacto,
-- ya que eso requeriría validar con mayor detalle la metodología y compatibilidad
-- conceptual de ambos datasets.
-- La vista de superficie provincial ya excluye los registros con provincia NULL.
-- El INNER JOIN calcula el ratio únicamente cuando existe información de
-- superficie y producción para la misma unidad geográfica y el mismo año.
-- La ausencia de producción para una provincia no se interpreta como valor 0.
-- NULLIF() evita una división por cero si alguna superficie total fuera 0.
-- Los registros marcados como duplicado_exacto se conservan porque durante
-- el profiling no se obtuvo evidencia suficiente para eliminarlos.


-- Ratio nacional de producción sobre superficie

SELECT
    s.anio,
    s.superficie_total,
    p.produccion_total,

    ROUND(
        p.produccion_total
        / NULLIF(s.superficie_total, 0),
        2
    ) AS quintales_por_hectarea

FROM vw_superficie_nacional_anual s

JOIN vw_produccion_nacional_anual p
    ON s.anio = p.anio

WHERE s.anio BETWEEN 2012 AND 2024

ORDER BY s.anio;


-- Ratio provincial de producción sobre superficie

SELECT
    s.anio,
    s.provincia,
    s.superficie_total,
    p.produccion_total,

    ROUND(
        p.produccion_total
        / NULLIF(s.superficie_total, 0),
        2
    ) AS quintales_por_hectarea

FROM vw_superficie_provincial_anual s

JOIN vw_produccion_provincial_anual p
    ON s.anio = p.anio
    AND s.provincia_id = p.provincia_id

WHERE s.anio BETWEEN 2012 AND 2024

ORDER BY
    s.anio,
    quintales_por_hectarea DESC;