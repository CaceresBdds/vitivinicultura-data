-- Pregunta:
-- ¿Qué provincias concentran la mayor superficie implantada y cuáles
-- concentran la mayor producción de uva en cada año entre 2012 y 2024?
--
-- Objetivo:
-- Asignar una posición anual a cada provincia según su superficie implantada
-- y, por separado, según su producción de uva.
--
-- Lógica:
-- 1. Utiliza las vistas provinciales anuales, donde superficie y producción
--    ya se encuentran agregadas por año y provincia.
-- 2. Utiliza DENSE_RANK() para ordenar las provincias de mayor a menor valor
--    dentro de cada año.
-- 3. Genera un ranking independiente para superficie y para producción.
--
-- Consideraciones:
-- La vista de superficie provincial ya excluye los registros con provincia NULL
-- porque no pueden atribuirse a una provincia concreta.
-- DENSE_RANK() asigna la misma posición a provincias con exactamente el mismo
-- valor y no deja saltos posteriores en la numeración.
-- Los rankings se reinician para cada año mediante PARTITION BY anio.
-- Los registros marcados como duplicado_exacto se conservan porque durante
-- el profiling no se obtuvo evidencia suficiente para eliminarlos.


-- Ranking anual por superficie implantada

SELECT
    anio,
    provincia,
    superficie_total,
    DENSE_RANK() OVER (
        PARTITION BY anio
        ORDER BY superficie_total DESC
    ) AS posicion
FROM vw_superficie_provincial_anual
WHERE anio BETWEEN 2012 AND 2024
ORDER BY
    anio,
    posicion;


-- Ranking anual por producción de uva

SELECT
    anio,
    provincia,
    produccion_total,
    DENSE_RANK() OVER (
        PARTITION BY anio
        ORDER BY produccion_total DESC
    ) AS posicion
FROM vw_produccion_provincial_anual
WHERE anio BETWEEN 2012 AND 2024
ORDER BY
    anio,
    posicion;