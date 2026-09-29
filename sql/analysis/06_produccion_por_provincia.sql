-- Pregunta:
-- ¿Cómo se distribuye la producción de uva entre las provincias
-- a lo largo del período 2012-2024?
--
-- Objetivo:
-- Obtener la producción total de uva por provincia para cada año,
-- permitiendo comparar cómo se distribuye territorialmente la producción
-- vitivinícola a lo largo del tiempo.
--
-- Lógica:
-- 1. Utiliza la vista vw_produccion_provincial_anual, donde la producción
--    ya se encuentra agregada por año y provincia.
-- 2. Limita el análisis al período 2012-2024.
-- 3. Ordena cada año desde la provincia con mayor producción hacia la menor.
--
-- Consideraciones:
-- El análisis se limita a 2012-2024 para mantener el mismo período utilizado
-- en las comparaciones conjuntas con superficie.
-- Producción no presenta registros con provincia NULL en el dataset cargado.
-- Los registros marcados como duplicado_exacto no se eliminan, ya que durante
-- el profiling no se obtuvo evidencia suficiente para considerarlos errores.

SELECT
    anio,
    provincia,
    produccion_total
FROM vw_produccion_provincial_anual
WHERE anio BETWEEN 2012 AND 2024
ORDER BY
    anio,
    produccion_total DESC;