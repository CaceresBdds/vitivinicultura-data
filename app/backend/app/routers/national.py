"""Endpoints del panorama nacional."""

from __future__ import annotations

import psycopg
from fastapi import APIRouter, Depends

from ..db import get_connection
from ..schemas.national import NationalEvolutionItem, NationalSummary
from ..services import national_service

router = APIRouter(prefix="/national", tags=["nacional"])


@router.get("/summary", response_model=NationalSummary)
def national_summary(conn: psycopg.Connection = Depends(get_connection)) -> NationalSummary:
    return national_service.get_national_summary(conn)


@router.get("/evolution", response_model=list[NationalEvolutionItem])
def national_evolution(
    conn: psycopg.Connection = Depends(get_connection),
) -> list[NationalEvolutionItem]:
    return national_service.get_national_evolution(conn)
