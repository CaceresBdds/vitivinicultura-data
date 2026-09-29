-- ============================================================
-- VISTAS ANALÍTICAS
-- ============================================================
-- Estas vistas contienen agregaciones reutilizables de las
-- tablas procesadas superficie_vinedos y produccion_uvas.
--
-- No almacenan físicamente los resultados: PostgreSQL ejecuta
-- la consulta asociada cada vez que la vista es consultada.
--
-- No se utiliza ORDER BY dentro de las vistas. El orden debe
-- definirse en la consulta que consume cada vista.
-- ============================================================


-- ------------------------------------------------------------
-- Superficie nacional anual
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW vw_superficie_nacional_anual AS
SELECT
    anio,
    SUM(superficie_ha) AS superficie_total
FROM superficie_vinedos
GROUP BY anio;


-- ------------------------------------------------------------
-- Producción nacional anual
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW vw_produccion_nacional_anual AS
SELECT
    anio,
    SUM(quintales) AS produccion_total
FROM produccion_uvas
GROUP BY anio;


-- ------------------------------------------------------------
-- Superficie provincial anual
-- ------------------------------------------------------------
-- Se excluyen registros sin provincia porque no pueden
-- atribuirse territorialmente a una provincia concreta.

CREATE OR REPLACE VIEW vw_superficie_provincial_anual AS
SELECT
    anio,
    provincia_id,
    provincia,
    SUM(superficie_ha) AS superficie_total
FROM superficie_vinedos
WHERE provincia IS NOT NULL
GROUP BY
    anio,
    provincia_id,
    provincia;


-- ------------------------------------------------------------
-- Producción provincial anual
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW vw_produccion_provincial_anual AS
SELECT
    anio,
    provincia_id,
    provincia,
    SUM(quintales) AS produccion_total
FROM produccion_uvas
GROUP BY
    anio,
    provincia_id,
    provincia;


-- ------------------------------------------------------------
-- Superficie departamental anual
-- ------------------------------------------------------------
-- Se excluyen registros sin departamento porque no pueden
-- atribuirse territorialmente a un departamento concreto.

CREATE OR REPLACE VIEW vw_superficie_departamental_anual AS
SELECT
    anio,
    provincia_id,
    provincia,
    departamento_id,
    departamento,
    SUM(superficie_ha) AS superficie_total
FROM superficie_vinedos
WHERE departamento_id IS NOT NULL
GROUP BY
    anio,
    provincia_id,
    provincia,
    departamento_id,
    departamento;


-- ------------------------------------------------------------
-- Producción departamental anual
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW vw_produccion_departamental_anual AS
SELECT
    anio,
    provincia_id,
    provincia,
    departamento_id,
    departamento,
    SUM(quintales) AS produccion_total
FROM produccion_uvas
GROUP BY
    anio,
    provincia_id,
    provincia,
    departamento_id,
    departamento;