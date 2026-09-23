from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

TIPOS_IDS = {
    "provincia_id": "string",
    "departamento_id": "string",
    "localidad_id": "string"
}

def extraer_datos():
    superficie = pd.read_csv(
        DATA_DIR / "inv-superficie-viniedos-2012-2024.csv",
        dtype=TIPOS_IDS
    )

    produccion = pd.read_csv(
        DATA_DIR / "inv-produccion-uvas-2012-2025.csv",
        dtype=TIPOS_IDS
    )

    return superficie, produccion