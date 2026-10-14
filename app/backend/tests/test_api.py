"""Pruebas de integración de la API contra PostgreSQL.

Requieren una base de datos accesible con las vistas analíticas cargadas.
Se pueden ejecutar con:

    pytest app/backend/tests
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app, raise_server_exceptions=False)


def test_national_summary_contract():
    response = client.get("/api/national/summary")
    assert response.status_code == 200
    body = response.json()
    assert body["year"] == 2024
    for key in (
        "surfaceHa",
        "productionQuintals",
        "surfaceChangePct",
        "productionChangePct",
    ):
        assert key in body
    assert isinstance(body["surfaceHa"], (int, float))
    assert isinstance(body["productionChangePct"], (int, float))


def test_national_evolution_ordering_and_null_yoy():
    response = client.get("/api/national/evolution")
    assert response.status_code == 200
    body = response.json()
    years = [item["year"] for item in body]
    assert years == sorted(years)
    assert years[0] == 2012
    assert years[-1] == 2024
    assert body[0]["surfaceYoYPct"] is None
    assert body[0]["productionYoYPct"] is None
    assert 2025 not in years


def test_provinces_requires_year():
    response = client.get("/api/provinces")
    assert response.status_code == 400
    assert "error" in response.json()


def test_provinces_invalid_year():
    response = client.get("/api/provinces", params={"year": 2011})
    assert response.status_code == 400
    assert response.json()["error"]


def test_provinces_valid_year_uses_ids_as_strings():
    response = client.get("/api/provinces", params={"year": 2024})
    assert response.status_code == 200
    body = response.json()
    assert body["year"] == 2024
    assert len(body["provinces"]) > 0
    mendoza = next(p for p in body["provinces"] if p["provinceId"] == "50")
    assert mendoza["province"] == "Mendoza"
    assert isinstance(mendoza["surfaceHa"], (int, float))


def test_province_summary_not_found():
    response = client.get("/api/provinces/999/summary", params={"year": 2024})
    assert response.status_code == 404
    assert "error" in response.json()


def test_province_summary_and_history():
    summary = client.get("/api/provinces/50/summary", params={"year": 2024})
    assert summary.status_code == 200
    assert summary.json()["provinceId"] == "50"

    history = client.get("/api/provinces/50/history")
    assert history.status_code == 200
    body = history.json()
    years = [item["year"] for item in body["history"]]
    assert years == sorted(years)
    assert all(2012 <= y <= 2024 for y in years)


def test_departments_contract_and_shares():
    response = client.get("/api/provinces/50/departments", params={"year": 2024})
    assert response.status_code == 200
    body = response.json()
    assert body["provinceId"] == "50"
    assert len(body["departments"]) > 0
    department = body["departments"][0]
    assert isinstance(department["departmentId"], str)
    assert department["surfaceHa"] is not None
