-- Pregunta:
-- ¿Cuál fue la superficie total implantada y la producción total de uva
-- por año entre 2012 y 2024?
--
-- Objetivo:
-- Construir una serie anual conjunta de superficie implantada y producción
-- de uva para el período común disponible en ambos datasets.
--
-- Lógica:
-- 1. Utiliza las vistas nacionales anuales, donde los datos ya se encuentran
--    agregados por año.
-- 2. Une superficie y producción mediante el año.
-- 3. Limita el resultado al período común 2012-2024.
--
-- Consideraciones:
-- vw_superficie_nacional_anual conserva todos los registros de superficie,
-- incluidas las filas con geografía incompleta, porque forman parte del total
-- nacional.
-- Producción dispone además de información para 2025, pero este análisis
-- termina en 2024 porque es el último año disponible para superficie.

SELECT
    s.anio,
    s.superficie_total,
    p.produccion_total
FROM vw_superficie_nacional_anual s
JOIN vw_produccion_nacional_anual p
    ON s.anio = p.anio
WHERE s.anio BETWEEN 2012 AND 2024
ORDER BY s.anio;