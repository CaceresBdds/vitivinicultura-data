from pathlib import Path

import pandas as pd


"""
Análisis exploratorio inicial del dataset de superficie de viñedos.

Este archivo conserva las comprobaciones realizadas durante el profiling
que sirvieron para definir posteriormente las reglas del pipeline ETL.

No forma parte de la ejecución del pipeline.
"""


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

TIPOS_IDS = {
    "provincia_id": "string",
    "departamento_id": "string",
    "localidad_id": "string"
}


# Carga del dataset
superficie = pd.read_csv(
    DATA_DIR / "inv-superficie-viniedos-2012-2024.csv",
    dtype=TIPOS_IDS
)


# -------------------------------------------------------------------
# 1. Estructura general
# -------------------------------------------------------------------

superficie.info()

print("\nPrimeras filas:")
print(superficie.head())

print("\nTipos de datos:")
print(superficie.dtypes)


# -------------------------------------------------------------------
# 2. Valores nulos
# -------------------------------------------------------------------

print("\nValores nulos por columna:")
print(superficie.isna().sum())

print("\nFilas con valores nulos:")
print(
    superficie[
        superficie.isna().any(axis=1)
    ]
)


# Revisión del contexto de las tres filas con geografía incompleta
print("\nFilas cercanas al índice 636:")
print(superficie.loc[632:640])

print("\nFilas cercanas al índice 1280:")
print(superficie.loc[1276:1284])

print("\nFilas cercanas al índice 1944:")
print(superficie.loc[1940:1948])


# -------------------------------------------------------------------
# 3. Cobertura temporal
# -------------------------------------------------------------------

print("\nAños presentes:")
print(superficie["anio"].unique())

print("\nCantidad de registros por año:")
print(
    superficie["anio"]
    .value_counts()
    .sort_index()
)


# -------------------------------------------------------------------
# 4. Localidades distintas por año
# -------------------------------------------------------------------

print("\nCantidad de localidad_id distintos por año:")
print(
    superficie
    .groupby("anio")["localidad_id"]
    .nunique()
)

print("\nCantidad de nombres de localidad distintos por año:")
print(
    superficie
    .groupby("anio")["localidad"]
    .nunique()
)


# -------------------------------------------------------------------
# 5. Relación localidad_id - localidad
# -------------------------------------------------------------------

localidades_por_id = (
    superficie
    .groupby("localidad_id")["localidad"]
    .nunique()
)

ids_con_varios_nombres = localidades_por_id[
    localidades_por_id > 1
]

print("\nIDs asociados a más de un nombre de localidad:")
print(ids_con_varios_nombres)


ids_multiples = ids_con_varios_nombres.index

print("\nNombres asociados a esos IDs:")
print(
    superficie[
        superficie["localidad_id"].isin(ids_multiples)
    ]
    .groupby("localidad_id")["localidad"]
    .unique()
)


# -------------------------------------------------------------------
# 6. Un mismo localidad_id con varios nombres en el mismo año
# -------------------------------------------------------------------

nombres_por_id_y_anio = (
    superficie
    .groupby(["anio", "localidad_id"])["localidad"]
    .nunique()
)

print("\nCombinaciones año + localidad_id con varios nombres:")
print(
    nombres_por_id_y_anio[
        nombres_por_id_y_anio > 1
    ]
)


# Ejemplo analizado durante el profiling
print("\nEjemplo: localidad_id 06035010 durante 2012:")
print(
    superficie[
        (superficie["anio"] == 2012)
        & (superficie["localidad_id"] == "06035010")
    ]
)


# -------------------------------------------------------------------
# 7. Relación inversa: localidad - localidad_id
# -------------------------------------------------------------------

ids_por_localidad = (
    superficie
    .groupby(
        ["departamento_id", "localidad"]
    )["localidad_id"]
    .nunique()
)

print("\nLocalidades asociadas a más de un localidad_id:")
print(
    ids_por_localidad[
        ids_por_localidad > 1
    ]
)


# -------------------------------------------------------------------
# 8. Granularidad de las filas
# -------------------------------------------------------------------

filas_por_localidad = (
    superficie
    .groupby(
        [
            "anio",
            "provincia",
            "departamento",
            "localidad",
            "localidad_id"
        ]
    )
    .size()
)

print("\nGrupos con más de una fila:")
print(
    filas_por_localidad[
        filas_por_localidad > 1
    ]
)


# Ejemplo analizado durante el profiling
print("\nEjemplo Tandil - 2012:")
print(
    superficie[
        (superficie["anio"] == 2012)
        & (superficie["provincia"] == "Buenos Aires")
        & (superficie["departamento"] == "Tandil")
        & (superficie["localidad"] == "Tandil")
    ]
)


# -------------------------------------------------------------------
# 9. Duplicados exactos
# -------------------------------------------------------------------

print("\nCantidad de duplicados exactos:")
print(superficie.duplicated().sum())

print("\nFilas involucradas en duplicados exactos:")
print(
    superficie[
        superficie.duplicated(keep=False)
    ]
)


# -------------------------------------------------------------------
# 10. Distribución de superficie_ha
# -------------------------------------------------------------------

print("\nDescripción de superficie_ha:")
print(
    superficie["superficie_ha"].describe()
)