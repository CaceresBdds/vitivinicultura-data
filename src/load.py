import os

import pandas as pd
import psycopg



def conectar_db():
    return psycopg.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

def preparar_filas(df, columnas):
    for fila in df[columnas].itertuples(index=False, name=None):
        fila_preparada = tuple(
            None if pd.isna(valor)
            else valor.item() if hasattr(valor, "item")
            else valor
            for valor in fila
        )

        yield fila_preparada

def cargar_superficie(cursor, superficie):
    columnas = [
        "anio",
        "provincia",
        "provincia_id",
        "departamento",
        "departamento_id",
        "localidad",
        "localidad_id",
        "superficie_ha",
        "geografia_incompleta",
        "duplicado_exacto"
    ]

    with cursor.copy(
        """
        COPY superficie_vinedos (
            anio,
            provincia,
            provincia_id,
            departamento,
            departamento_id,
            localidad,
            localidad_id,
            superficie_ha,
            geografia_incompleta,
            duplicado_exacto
            )
            FROM STDIN
            """
    ) as copy:

        for fila in preparar_filas(superficie, columnas):
            copy.write_row(fila)

def cargar_produccion(cursor, produccion):
    columnas = [
        "anio",
        "provincia",
        "provincia_id",
        "departamento",
        "departamento_id",
        "localidad",
        "localidad_id",
        "quintales",
        "duplicado_exacto"
    ]

    with cursor.copy(
        """
        COPY produccion_uvas (
            anio,
            provincia,
            provincia_id,
            departamento,
            departamento_id,
            localidad,
            localidad_id,
            quintales,
            duplicado_exacto
        )
        FROM STDIN
        """
    ) as copy:

        for fila in preparar_filas(produccion, columnas):
            copy.write_row(fila)

def cargar_datos(superficie, produccion):
    with conectar_db() as conexion:
        with conexion.cursor() as cursor: 

            cursor.execute(
                """
                TRUNCATE TABLE
                    superficie_vinedos,
                    produccion_uvas
                RESTART IDENTITY;
                """
            )

            cargar_superficie(cursor, superficie)
            cargar_produccion(cursor, produccion)