-- Pregunta:
-- ¿Qué participación porcentual tiene cada provincia sobre el total nacional
-- de superficie implantada y de producción de uva entre 2012 y 2024?
--
-- Objetivo:
-- Medir el peso relativo de cada provincia dentro del total nacional de cada año,
-- tanto para superficie implantada como para producción de uva.
--
-- Lógica:
-- 1. Utiliza las vistas provinciales anuales, donde superficie y producción
--    ya se encuentran agregadas por año y provincia.
-- 2. Utiliza las vistas nacionales anuales, donde ambas métricas ya se encuentran
--    agregadas por año.
-- 3. Une el total provincial con el total nacional correspondiente al mismo año.
-- 4. Calcula la participación provincial mediante:
--    valor_provincial / valor_nacional * 100.
-- 5. Ordena las provincias de mayor a menor participación dentro de cada año.
--
-- Consideraciones:
-- La vista de superficie provincial excluye los registros con provincia NULL,
-- porque no pueden atribuirse a una provincia concreta.
-- Sin embargo, la vista nacional de superficie sí conserva esos registros.
-- Por este motivo, en los años donde existen registros sin provincia asignada,
-- la suma de las participaciones provinciales puede ser ligeramente inferior al 100%.
-- Producción no presenta registros con provincia NULL en el dataset cargado.
-- NULLIF() evita una división por cero en caso de que algún total nacional sea 0.
-- Los registros marcados como duplicado_exacto se conservan porque durante
-- el profiling no se obtuvo evidencia suficiente para eliminarlos.


-- Participación provincial sobre la superficie nacional

SELECT
    p.anio,
    p.provincia,
    p.superficie_total AS superficie_provincia,

    ROUND(
        p.superficie_total
        / NULLIF(n.superficie_total, 0) * 100,
        2
    ) AS participacion_pct

FROM vw_superficie_provincial_anual p

JOIN vw_superficie_nacional_anual n
    ON p.anio = n.anio

WHERE p.anio BETWEEN 2012 AND 2024

ORDER BY
    p.anio,
    participacion_pct DESC;


-- Participación provincial sobre la producción nacional

SELECT
    p.anio,
    p.provincia,
    p.produccion_total AS produccion_provincia,

    ROUND(
        p.produccion_total
        / NULLIF(n.produccion_total, 0) * 100,
        2
    ) AS participacion_pct

FROM vw_produccion_provincial_anual p

JOIN vw_produccion_nacional_anual n
    ON p.anio = n.anio

WHERE p.anio BETWEEN 2012 AND 2024

ORDER BY
    p.anio,
    participacion_pct DESC;