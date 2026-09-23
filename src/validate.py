def validar_datos(superficie, produccion):
    if len(superficie) != 9053:
        raise ValueError(
            f"Cantidad inesperada de filas en Superficie: {len(superficie)}"
        )

    if len(produccion) != 7582:
        raise ValueError(
            f"Cantidad inesperada de filas en Producción: {len(produccion)}"
        )

    if superficie["geografia_incompleta"].sum() != 3:
        raise ValueError(
            "Cantidad inesperada de registros con geografía incompleta"
        )

    if superficie["duplicado_exacto"].sum() != 2:
        raise ValueError(
            "Cantidad inesperada de filas duplicadas en Superficie"
        )

    if produccion["duplicado_exacto"].sum() != 2:
        raise ValueError(
            "Cantidad inesperada de filas duplicadas en Producción"
        )