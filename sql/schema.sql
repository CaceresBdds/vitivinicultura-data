CREATE TABLE superficie_vinedos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    anio INTERGER NOT NULL,

    provincia TEXT,
    provincia_id TEXT,

    departamento TEXT,
    departamento_id TEXT,

    localidad TEXT,
    localidad_id TEXT,
    superficie_ha NUMERIC NOT NULL,

    geografia_incompleta BOOLEAN NOT NULL,
    duplicado_exacto BOOLEAN NOT NULL
);

CREATE TABLE produccion_uvas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    anio INTEGER NOT NULL,

    provincia TEXT NOT NULL,
    provincia_id TEXT NOT NULL,

    departamento TEXT NOT NULL,
    departamento_id TEXT NOT NULL,

    localidad TEXT NOT NULL,
    localidad_id TEXT NOT NULL,

    quintales NUMERIC NOT NULL,

    duplicado_exacto BOOLEAN NOT NULL
);

