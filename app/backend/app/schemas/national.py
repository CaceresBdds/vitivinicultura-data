"""Modelos de respuesta para los endpoints nacionales."""

from __future__ import annotations

from pydantic import BaseModel


class NationalSummary(BaseModel):
    year: int
    surfaceHa: float | None
    productionQuintals: float | None
    surfaceChangePct: float | None
    productionChangePct: float | None


class NationalEvolutionItem(BaseModel):
    year: int
    surfaceHa: float | None
    productionQuintals: float | None
    surfaceYoYPct: float | None
    productionYoYPct: float | None
