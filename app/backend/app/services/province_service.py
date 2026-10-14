"""Consultas analíticas provinciales y departamentales.

Se apoyan en las vistas:
- vw_superficie_provincial_anual
- vw_produccion_provincial_anual
- vw_superficie_departamental_anual
- vw_produccion_departamental_anual
- vw_superficie_nacional_anual
- vw_produccion_nacional_anual
"""

from __future__ import annotations

import psycopg
from fastapi import HTTPException

from ..schemas.province import (
    DepartmentItem,
    DepartmentsResponse,
    ProvinceHistory,
    ProvinceHistoryItem,
    ProvinceItem,
    ProvincesResponse,
    ProvinceSummary,
)
from ..validation import round2, to_float

MIN_YEAR = 2012
MAX_YEAR = 2024


def _find_province_name(conn: psycopg.Connection, province_id: str) -> str | None:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT provincia
            FROM vw_superficie_provincial_anual
            WHERE provincia_id = %(pid)s
            UNION ALL
            SELECT provincia
            FROM vw_produccion_provincial_anual
            WHERE provincia_id = %(pid)s
            LIMIT 1
            """,
            {"pid": province_id},
        )
        row = cur.fetchone()
    return row["provincia"] if row else None


def _require_province(conn: psycopg.Connection, province_id: str) -> str:
    name = _find_province_name(conn, province_id)
    if name is None:
        raise HTTPException(status_code=404, detail="Provincia no encontrada.")
    return name


def _national_totals(
    conn: psycopg.Connection, year: int
) -> tuple[float | None, float | None]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT superficie_total FROM vw_superficie_nacional_anual WHERE anio = %(y)s",
            {"y": year},
        )
        surface_row = cur.fetchone()
        cur.execute(
            "SELECT produccion_total FROM vw_produccion_nacional_anual WHERE anio = %(y)s",
            {"y": year},
        )
        production_row = cur.fetchone()
    surface = to_float(surface_row["superficie_total"]) if surface_row else None
    production = to_float(production_row["produccion_total"]) if production_row else None
    return surface, production


def _share(value: float | None, total: float | None) -> float | None:
    if value is None or total is None or total == 0:
        return None
    return round2(value / total * 100)


def _ratio(production: float | None, surface: float | None) -> float | None:
    if production is None or surface is None or surface == 0:
        return None
    return round2(production / surface)


def get_provinces(conn: psycopg.Connection, year: int) -> ProvincesResponse:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                sp.provincia_id,
                sp.provincia,
                sp.superficie_total,
                pp.produccion_total,
                ns.superficie_total AS national_surface,
                np.produccion_total AS national_production
            FROM vw_superficie_provincial_anual sp
            LEFT JOIN vw_produccion_provincial_anual pp
                ON pp.anio = sp.anio
               AND pp.provincia_id = sp.provincia_id
            JOIN vw_superficie_nacional_anual ns
                ON ns.anio = sp.anio
            LEFT JOIN vw_produccion_nacional_anual np
                ON np.anio = sp.anio
            WHERE sp.anio = %(year)s
            ORDER BY sp.superficie_total DESC
            """,
            {"year": year},
        )
        rows = cur.fetchall()

    provinces = []
    for row in rows:
        surface = to_float(row["superficie_total"])
        production = to_float(row["produccion_total"])
        national_surface = to_float(row["national_surface"])
        national_production = to_float(row["national_production"])
        provinces.append(
            ProvinceItem(
                provinceId=str(row["provincia_id"]),
                province=row["provincia"],
                surfaceHa=surface,
                productionQuintals=production,
                surfaceSharePct=_share(surface, national_surface),
                productionSharePct=_share(production, national_production),
                productionSurfaceRatio=_ratio(production, surface),
            )
        )

    return ProvincesResponse(year=year, provinces=provinces)


def get_province_summary(
    conn: psycopg.Connection, province_id: str, year: int
) -> ProvinceSummary:
    name = _require_province(conn, province_id)

    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT superficie_total
            FROM vw_superficie_provincial_anual
            WHERE anio = %(year)s AND provincia_id = %(pid)s
            """,
            {"year": year, "pid": province_id},
        )
        surface_row = cur.fetchone()
        cur.execute(
            """
            SELECT produccion_total
            FROM vw_produccion_provincial_anual
            WHERE anio = %(year)s AND provincia_id = %(pid)s
            """,
            {"year": year, "pid": province_id},
        )
        production_row = cur.fetchone()

    surface = to_float(surface_row["superficie_total"]) if surface_row else None
    production = to_float(production_row["produccion_total"]) if production_row else None
    national_surface, national_production = _national_totals(conn, year)

    return ProvinceSummary(
        year=year,
        provinceId=province_id,
        province=name,
        surfaceHa=surface,
        productionQuintals=production,
        surfaceSharePct=_share(surface, national_surface),
        productionSharePct=_share(production, national_production),
        productionSurfaceRatio=_ratio(production, surface),
    )


def get_province_history(conn: psycopg.Connection, province_id: str) -> ProvinceHistory:
    name = _require_province(conn, province_id)

    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                COALESCE(s.anio, p.anio) AS year,
                s.superficie_total AS surface_ha,
                p.produccion_total AS production_quintals
            FROM (
                SELECT anio, superficie_total
                FROM vw_superficie_provincial_anual
                WHERE provincia_id = %(pid)s
                  AND anio BETWEEN %(min)s AND %(max)s
            ) s
            FULL OUTER JOIN (
                SELECT anio, produccion_total
                FROM vw_produccion_provincial_anual
                WHERE provincia_id = %(pid)s
                  AND anio BETWEEN %(min)s AND %(max)s
            ) p
                ON p.anio = s.anio
            ORDER BY COALESCE(s.anio, p.anio)
            """,
            {"pid": province_id, "min": MIN_YEAR, "max": MAX_YEAR},
        )
        rows = cur.fetchall()

    history = [
        ProvinceHistoryItem(
            year=row["year"],
            surfaceHa=to_float(row["surface_ha"]),
            productionQuintals=to_float(row["production_quintals"]),
        )
        for row in rows
    ]

    return ProvinceHistory(provinceId=province_id, province=name, history=history)


def get_departments(
    conn: psycopg.Connection, province_id: str, year: int
) -> DepartmentsResponse:
    name = _require_province(conn, province_id)

    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                sd.departamento_id,
                sd.departamento,
                sd.superficie_total,
                pd.produccion_total
            FROM vw_superficie_departamental_anual sd
            LEFT JOIN vw_produccion_departamental_anual pd
                ON pd.anio = sd.anio
               AND pd.departamento_id = sd.departamento_id
            WHERE sd.anio = %(year)s
              AND sd.provincia_id = %(pid)s
            ORDER BY sd.superficie_total DESC
            """,
            {"year": year, "pid": province_id},
        )
        rows = cur.fetchall()

        cur.execute(
            "SELECT superficie_total FROM vw_superficie_provincial_anual "
            "WHERE anio = %(year)s AND provincia_id = %(pid)s",
            {"year": year, "pid": province_id},
        )
        province_surface_row = cur.fetchone()
        cur.execute(
            "SELECT produccion_total FROM vw_produccion_provincial_anual "
            "WHERE anio = %(year)s AND provincia_id = %(pid)s",
            {"year": year, "pid": province_id},
        )
        province_production_row = cur.fetchone()

    province_surface = (
        to_float(province_surface_row["superficie_total"]) if province_surface_row else None
    )
    province_production = (
        to_float(province_production_row["produccion_total"])
        if province_production_row
        else None
    )

    departments = []
    for row in rows:
        surface = to_float(row["superficie_total"])
        production = to_float(row["produccion_total"])
        departments.append(
            DepartmentItem(
                departmentId=str(row["departamento_id"]),
                department=row["departamento"],
                surfaceHa=surface,
                productionQuintals=production,
                surfaceSharePct=_share(surface, province_surface),
                productionSharePct=_share(production, province_production),
            )
        )

    return DepartmentsResponse(
        year=year,
        provinceId=province_id,
        province=name,
        departments=departments,
    )
