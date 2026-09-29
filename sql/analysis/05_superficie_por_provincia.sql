-- Pregunta:
-- ¿Cómo se distribuye la superficie implantada entre las provincias
-- a lo largo del período 2012-2024?
--
-- Objetivo:
-- Obtener la superficie total implantada por provincia para cada año,
-- permitiendo comparar la distribución territorial de la superficie
-- vitivinícola a lo largo del tiempo.
--
-- Lógica:
-- 1. Utiliza la vista vw_superficie_provincial_anual, donde la superficie
--    ya se encuentra agregada por año y provincia.
-- 2. Limita el análisis al período 2012-2024.
-- 3. Ordena cada año desde la provincia con mayor superficie hacia la menor.
--
-- Consideraciones:
-- La vista excluye los registros cuya provincia es NULL porque no pueden
-- atribuirse a ninguna provincia concreta.
-- Esas filas sí se conservan en los análisis nacionales, donde su ubicación
-- geográfica no es necesaria para formar parte del total.
-- Los registros marcados como duplicado_exacto no se eliminan, ya que durante
-- el profiling no se obtuvo evidencia suficiente para considerarlos errores.

SELECT
    anio,
    provincia,
    superficie_total
FROM vw_superficie_provincial_anual
WHERE anio BETWEEN 2012 AND 2024
ORDER BY
    anio,
    superficie_total DESC;