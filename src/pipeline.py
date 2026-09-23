from pathlib import Path

from dotenv import load_dotenv

from extract import extraer_datos
from transform import transformar_superficie, transformar_produccion
from validate import validar_datos
from load import cargar_datos


BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)


def main():
    superficie, produccion = extraer_datos()

    superficie_transformada = transformar_superficie(superficie)
    produccion_transformada = transformar_produccion(produccion)

    validar_datos(
        superficie_transformada,
        produccion_transformada
    )

    cargar_datos(
        superficie_transformada,
        produccion_transformada
    )

    print("Pipeline ejecutado correctamente.")


if __name__ == "__main__":
    main()