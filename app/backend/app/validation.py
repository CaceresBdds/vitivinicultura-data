"""Reglas de validación compartidas por los endpoints."""

from __future__ import annotations

from fastapi import HTTPException

MIN_YEAR = 2012
MAX_YEAR = 2024


def validate_year(year: int) -> int:
    """Valida que el año esté dentro del período común 2012-2024."""
    if year < MIN_YEAR or year > MAX_YEAR:
        raise HTTPException(
            status_code=400,
            detail=f"El año debe encontrarse entre {MIN_YEAR} y {MAX_YEAR}.",
        )
    return year


def round2(value: float | None) -> float | None:
    """Redondea a dos decimales conservando los valores ausentes como null."""
    if value is None:
        return None
    return round(float(value), 2)


def to_float(value: object) -> float | None:
    """Convierte valores NUMERIC/Decimal a float, preservando null."""
    if value is None:
        return None
    return float(value)
