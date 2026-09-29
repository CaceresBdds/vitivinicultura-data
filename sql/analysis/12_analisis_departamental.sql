-- Preguntas:
-- ¿Cómo se distribuyen la superficie implantada y la producción de uva
-- dentro de cada provincia por departamento entre 2012 y 2024?
--
-- ¿Qué departamentos concentran los mayores valores de superficie
-- y producción dentro de cada provincia y año?
--
-- Objetivo:
-- Analizar la distribución territorial de superficie y producción a nivel
-- departamental y generar rankings anuales dentro de cada provincia.
--
-- Lógica:
-- 1. Utiliza las vistas departamentales anuales, donde superficie y producción
--    ya se encuentran agregadas por año, provincia y departamento.
-- 2. Ordena los departamentos de cada provincia según sus valores totales.
-- 3. Utiliza DENSE_RANK() para asignar una posición a cada departamento
--    dentro de su provincia y año.
--
-- Consideraciones:
-- La vista de superficie departamental ya excluye los registros con
-- departamento_id NULL porque no pueden atribuirse a un departamento concreto.
-- Producción no presenta registros geográficos nulos en el dataset cargado.
-- Los rankings se reinician para cada combinación de año y provincia mediante
-- PARTITION BY anio, provincia_id.
-- DENSE_RANK() asigna la misma posición cuando existen valores exactamente
-- iguales y no deja saltos posteriores en la numeración.
-- Los registros marcados como duplicado_exacto se conservan porque durante
-- el profiling no se obtuvo evidencia suficiente para eliminarlos.


-- Distribución departamental de superficie implantada

SELECT
    anio,
    provincia,
    departamento,
    superficie_total
FROM vw_superficie_departamental_anual
WHERE anio BETWEEN 2012 AND 2024
ORDER BY
    anio,
    provincia,
    superficie_total DESC;


-- Distribución departamental de producción de uva

SELECT
    anio,
    provincia,
    departamento,
    produccion_total
FROM vw_produccion_departamental_anual
WHERE anio BETWEEN 2012 AND 2024
ORDER BY
    anio,
    provincia,
    produccion_total DESC;


-- Ranking departamental por superficie dentro de cada provincia y año

SELECT
    anio,
    provincia,
    departamento,
    superficie_total,

    DENSE_RANK() OVER (
        PARTITION BY anio, provincia_id
        ORDER BY superficie_total DESC
    ) AS posicion

FROM vw_superficie_departamental_anual

WHERE anio BETWEEN 2012 AND 2024

ORDER BY
    anio,
    provincia,
    posicion;


-- Ranking departamental por producción dentro de cada provincia y año

SELECT
    anio,
    provincia,
    departamento,
    produccion_total,

    DENSE_RANK() OVER (
        PARTITION BY anio, provincia_id
        ORDER BY produccion_total DESC
    ) AS posicion

FROM vw_produccion_departamental_anual

WHERE anio BETWEEN 2012 AND 2024

ORDER BY
    anio,
    provincia,
    posicion;