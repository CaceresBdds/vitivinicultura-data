"""Modelos de respuesta para los endpoints provinciales y departamentales."""

from __future__ import annotations

from pydantic import BaseModel


class ProvinceItem(BaseModel):
    provinceId: str
    province: str
    surfaceHa: float | None
    productionQuintals: float | None
    surfaceSharePct: float | None
    productionSharePct: float | None
    productionSurfaceRatio: float | None


class ProvincesResponse(BaseModel):
    year: int
    provinces: list[ProvinceItem]


class ProvinceSummary(BaseModel):
    year: int
    provinceId: str
    province: str
    surfaceHa: float | None
    productionQuintals: float | None
    surfaceSharePct: float | None
    productionSharePct: float | None
    productionSurfaceRatio: float | None


class ProvinceHistoryItem(BaseModel):
    year: int
    surfaceHa: float | None
    productionQuintals: float | None


class ProvinceHistory(BaseModel):
    provinceId: str
    province: str
    history: list[ProvinceHistoryItem]


class DepartmentItem(BaseModel):
    departmentId: str
    department: str
    surfaceHa: float | None
    productionQuintals: float | None
    surfaceSharePct: float | None
    productionSharePct: float | None


class DepartmentsResponse(BaseModel):
    year: int
    provinceId: str
    province: str
    departments: list[DepartmentItem]
