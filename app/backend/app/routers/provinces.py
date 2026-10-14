"""Endpoints de análisis provincial y departamental."""

from __future__ import annotations

import psycopg
from fastapi import APIRouter, Depends, Query

from ..db import get_connection
from ..schemas.province import (
    DepartmentsResponse,
    ProvincesResponse,
    ProvinceHistory,
    ProvinceSummary,
)
from ..services import province_service
from ..validation import validate_year

router = APIRouter(prefix="/provinces", tags=["provincias"])


@router.get("", response_model=ProvincesResponse)
def list_provinces(
    year: int = Query(..., description="Año del período 2012-2024"),
    conn: psycopg.Connection = Depends(get_connection),
) -> ProvincesResponse:
    validate_year(year)
    return province_service.get_provinces(conn, year)


@router.get("/{provinceId}/summary", response_model=ProvinceSummary)
def province_summary(
    provinceId: str,
    year: int = Query(..., description="Año del período 2012-2024"),
    conn: psycopg.Connection = Depends(get_connection),
) -> ProvinceSummary:
    validate_year(year)
    return province_service.get_province_summary(conn, provinceId, year)


@router.get("/{provinceId}/history", response_model=ProvinceHistory)
def province_history(
    provinceId: str,
    conn: psycopg.Connection = Depends(get_connection),
) -> ProvinceHistory:
    return province_service.get_province_history(conn, provinceId)


@router.get("/{provinceId}/departments", response_model=DepartmentsResponse)
def province_departments(
    provinceId: str,
    year: int = Query(..., description="Año del período 2012-2024"),
    conn: psycopg.Connection = Depends(get_connection),
) -> DepartmentsResponse:
    validate_year(year)
    return province_service.get_departments(conn, provinceId, year)
