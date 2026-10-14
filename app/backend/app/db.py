"""Acceso a PostgreSQL mediante psycopg 3.

La configuración se obtiene de variables de entorno (DB_HOST, DB_PORT,
DB_NAME, DB_USER, DB_PASSWORD). Si existe un archivo .env en el proyecto,
se carga automáticamente para facilitar el desarrollo local.

No se almacenan credenciales en el código.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Iterator

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row


def _load_env_file() -> None:
    """Carga el primer archivo .env encontrado subiendo desde este módulo."""
    for parent in Path(__file__).resolve().parents:
        env_path = parent / ".env"
        if env_path.is_file():
            load_dotenv(env_path)
            return


_load_env_file()


def _connection_kwargs() -> dict[str, object]:
    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": os.getenv("DB_PORT", "5432"),
        "dbname": os.getenv("DB_NAME", "vitivinicultura"),
        "user": os.getenv("DB_USER", "postgres"),
        "password": os.getenv("DB_PASSWORD", ""),
        "row_factory": dict_row,
    }


def get_connection() -> Iterator[psycopg.Connection]:
    """Dependencia de FastAPI: abre y cierra una conexión por request."""
    connection = psycopg.connect(**_connection_kwargs())
    try:
        yield connection
    finally:
        connection.close()
