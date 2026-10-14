"""Consultas analíticas nacionales.

Se apoyan exclusivamente en las vistas:
- vw_superficie_nacional_anual
- vw_produccion_nacional_anual
"""

from __future__ import annotations

import psycopg

from ..schemas.national import NationalEvolutionItem, NationalSummary
from ..validation import round2, to_float

REFERENCE_YEAR = 2024
BASE_YEAR = 2012


def get_national_summary(conn: psycopg.Connection) -> NationalSummary:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                MAX(superficie_total) FILTER (WHERE anio = %(ref)s) AS surface_ref,
                MAX(superficie_total) FILTER (WHERE anio = %(base)s) AS surface_base
            FROM vw_superficie_nacional_anual
            WHERE anio IN (%(ref)s, %(base)s)
            """,
            {"ref": REFERENCE_YEAR, "base": BASE_YEAR},
        )
        surface = cur.fetchone() or {}

        cur.execute(
            """
            SELECT
                MAX(produccion_total) FILTER (WHERE anio = %(ref)s) AS production_ref,
                MAX(produccion_total) FILTER (WHERE anio = %(base)s) AS production_base
            FROM vw_produccion_nacional_anual
            WHERE anio IN (%(ref)s, %(base)s)
            """,
            {"ref": REFERENCE_YEAR, "base": BASE_YEAR},
        )
        production = cur.fetchone() or {}

    surface_ref = to_float(surface.get("surface_ref"))
    surface_base = to_float(surface.get("surface_base"))
    production_ref = to_float(production.get("production_ref"))
    production_base = to_float(production.get("production_base"))

    return NationalSummary(
        year=REFERENCE_YEAR,
        surfaceHa=surface_ref,
        productionQuintals=production_ref,
        surfaceChangePct=_pct_change(surface_base, surface_ref),
        productionChangePct=_pct_change(production_base, production_ref),
    )


def get_national_evolution(conn: psycopg.Connection) -> list[NationalEvolutionItem]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                s.anio AS year,
                s.superficie_total AS surface_ha,
                p.produccion_total AS production_quintals,
                (
                    s.superficie_total - LAG(s.superficie_total) OVER (ORDER BY s.anio)
                ) / NULLIF(LAG(s.superficie_total) OVER (ORDER BY s.anio), 0) * 100
                    AS surface_yoy,
                (
                    p.produccion_total - LAG(p.produccion_total) OVER (ORDER BY s.anio)
                ) / NULLIF(LAG(p.produccion_total) OVER (ORDER BY s.anio), 0) * 100
                    AS production_yoy
            FROM vw_superficie_nacional_anual s
            JOIN vw_produccion_nacional_anual p
                ON p.anio = s.anio
            WHERE s.anio BETWEEN %(base)s AND %(ref)s
            ORDER BY s.anio
            """,
            {"base": BASE_YEAR, "ref": REFERENCE_YEAR},
        )
        rows = cur.fetchall()

    return [
        NationalEvolutionItem(
            year=row["year"],
            surfaceHa=to_float(row["surface_ha"]),
            productionQuintals=to_float(row["production_quintals"]),
            surfaceYoYPct=round2(to_float(row["surface_yoy"])),
            productionYoYPct=round2(to_float(row["production_yoy"])),
        )
        for row in rows
    ]


def _pct_change(base: float | None, current: float | None) -> float | None:
    if base is None or current is None or base == 0:
        return None
    return round2((current - base) / base * 100)
