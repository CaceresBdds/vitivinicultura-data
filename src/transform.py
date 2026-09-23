def transformar_superficie(df):
    resultado = df.copy()

    resultado["geografia_incompleta"] = (
        resultado[
            ["provincia_id", "departamento_id", "localidad_id"]
        ]
        .isna()
        .any(axis=1)
    )

    resultado["duplicado_exacto"] = resultado.duplicated(
        subset=[
            "anio",
            "provincia",
            "provincia_id",
            "departamento",
            "departamento_id",
            "localidad",
            "localidad_id",
            "superficie_ha"
        ],
        keep=False
    )

    return resultado


def transformar_produccion(df):
    resultado = df.copy()

    resultado["duplicado_exacto"] = resultado.duplicated(
        subset=[
            "anio",
            "provincia",
            "provincia_id",
            "departamento",
            "departamento_id",
            "localidad",
            "localidad_id",
            "quintales"
        ],
        keep=False
    )

    return resultado