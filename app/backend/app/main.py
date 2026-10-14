"""Aplicación FastAPI de consulta de datos vitivinícolas argentinos.

Expone una API REST de solo lectura bajo el prefijo /api.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .routers import national, provinces

logger = logging.getLogger("vitivinicultura.api")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="API Vitivinicultura Argentina",
    description=(
        "API REST de solo lectura sobre las vistas analíticas del proyecto "
        "de datos vitivinícolas argentinos."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(national.router, prefix="/api")
app.include_router(provinces.router, prefix="/api")


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(status_code=400, content={"error": "Parámetros inválidos."})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Error interno no controlado")
    return JSONResponse(status_code=500, content={"error": "Error interno del servidor."})
