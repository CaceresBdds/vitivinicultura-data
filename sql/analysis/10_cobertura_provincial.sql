-- Pregunta:
-- ¿Qué provincias tienen registros de superficie implantada pero no presentan
-- registros de producción de uva en el mismo año entre 2012 y 2024?
--
-- Objetivo:
-- Detectar diferencias de cobertura entre ambos datasets a nivel provincial
-- y anual.
--
-- Lógica:
-- 1. Utiliza las vistas provinciales anuales, donde cada combinación de
--    año y provincia ya se encuentra consolidada.
-- 2. Parte de las combinaciones presentes en superficie.
-- 3. Utiliza LEFT JOIN para buscar la misma combinación de año y provincia
--    dentro de producción.
-- 4. Filtra los casos donde no existe una coincidencia en producción.
--
-- Consideraciones:
-- La vista de superficie provincial ya excluye los registros con provincia
-- NULL porque no pueden utilizarse para comparar cobertura territorial.
-- La ausencia de una combinación año + provincia en Producción no significa
-- que la producción haya sido 0; solamente indica que no existe un registro
-- correspondiente en el dataset cargado.
-- No es necesario utilizar DISTINCT porque las vistas provinciales ya contienen
-- una única fila para cada combinación de año y provincia.

SELECT
    s.anio,
    s.provincia
FROM vw_superficie_provincial_anual s

LEFT JOIN vw_produccion_provincial_anual p
    ON s.anio = p.anio
    AND s.provincia_id = p.provincia_id

WHERE s.anio BETWEEN 2012 AND 2024
  AND p.provincia_id IS NULL

ORDER BY
    s.anio,
    s.provincia;