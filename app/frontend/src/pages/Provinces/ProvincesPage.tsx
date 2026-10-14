import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { IndicatorCard } from "../../components/IndicatorCard";
import { RankingBars, type RankingItem } from "../../components/RankingBars";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/StateViews";
import { YearSelector, clampYear } from "../../components/YearSelector";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";
import { METRIC_COLORS } from "../../theme";
import type { Province } from "../../types";
import {
  formatHectares,
  formatQuintals,
  formatRatio,
  formatShare,
} from "../../utils/format";

function sortBySurface(provinces: Province[]): Province[] {
  return [...provinces].sort(
    (a, b) => (b.surfaceHa ?? -Infinity) - (a.surfaceHa ?? -Infinity)
  );
}

function sortByProduction(provinces: Province[]): Province[] {
  return [...provinces].sort(
    (a, b) =>
      (b.productionQuintals ?? -Infinity) -
      (a.productionQuintals ?? -Infinity)
  );
}

function toRankingItems(
  provinces: Province[],
  metric: "surface" | "production"
): RankingItem[] {
  return provinces.map((province) => ({
    id: province.provinceId,
    name: province.province,
    value:
      metric === "surface"
        ? province.surfaceHa
        : province.productionQuintals,
    sharePct:
      metric === "surface"
        ? province.surfaceSharePct
        : province.productionSharePct,
  }));
}

export function ProvincesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const year = clampYear(Number(searchParams.get("year")));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, loading, error, reload } = useApi(
    () => api.getProvinces(year),
    [year]
  );

  const handleYearChange = (value: number) => {
    setSearchParams({ year: String(value) });
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!data || data.provinces.length === 0) {
    return (
      <div className="page">
        <EmptyState />
      </div>
    );
  }

  const bySurface = sortBySurface(data.provinces);
  const byProduction = sortByProduction(data.provinces);
  const selected =
    data.provinces.find((province) => province.provinceId === selectedId) ??
    null;

  return (
    <div className="page">
      <header className="page__header page__header--row">
        <div>
          <h1 className="page__title">Análisis provincial</h1>
          <p className="page__subtitle">
            Comparación territorial de superficie y producción
          </p>
        </div>
        <YearSelector year={year} onChange={handleYearChange} />
      </header>

      <section className="charts-grid charts-grid--two">
        <article className="card">
          <header className="card__header">
            <h2 className="card__title">Superficie implantada por provincia</h2>
            <p className="card__subtitle">Hectáreas · {year}</p>
          </header>
          <RankingBars
            items={toRankingItems(bySurface, "surface")}
            color={METRIC_COLORS.surface}
            formatValue={(value) => formatHectares(value)}
            formatShare={(value) => formatShare(value)}
            selectedId={selectedId}
            onSelect={setSelectedId}
            valueHeading="Superficie"
            ariaLabel={`Superficie implantada por provincia en ${year}`}
          />
        </article>

        <article className="card">
          <header className="card__header">
            <h2 className="card__title">Producción de uva por provincia</h2>
            <p className="card__subtitle">Quintales · {year}</p>
          </header>
          <RankingBars
            items={toRankingItems(byProduction, "production")}
            color={METRIC_COLORS.production}
            formatValue={(value) => formatQuintals(value)}
            formatShare={(value) => formatShare(value)}
            selectedId={selectedId}
            onSelect={setSelectedId}
            valueHeading="Producción"
            ariaLabel={`Producción de uva por provincia en ${year}`}
          />
        </article>
      </section>

      {selected ? (
        <section className="card selection-summary">
          <header className="card__header card__header--row">
            <div>
              <h2 className="card__title">
                Provincia seleccionada: {selected.province}
              </h2>
              <p className="card__subtitle">Indicadores · {year}</p>
            </div>
            <Link
              className="button button--primary"
              to={`/provinces/${selected.provinceId}?year=${year}`}
            >
              Ver detalle de {selected.province} →
            </Link>
          </header>
          <div className="indicators-grid indicators-grid--five">
            <IndicatorCard
              label="Superficie implantada"
              value={formatHectares(selected.surfaceHa)}
              tone="surface"
            />
            <IndicatorCard
              label="Producción de uva"
              value={formatQuintals(selected.productionQuintals)}
              tone="production"
            />
            <IndicatorCard
              label="Participación superficie"
              value={formatShare(selected.surfaceSharePct)}
              tone="surface"
            />
            <IndicatorCard
              label="Participación producción"
              value={formatShare(selected.productionSharePct)}
              tone="production"
            />
            <IndicatorCard
              label="Ratio producción/superficie"
              value={formatRatio(selected.productionSurfaceRatio)}
            />
          </div>
          {selected.productionQuintals === null ? (
            <p className="inline-note">
              Sin dato de producción para {selected.province} en {year}.
            </p>
          ) : null}
        </section>
      ) : (
        <p className="hint">
          Seleccioná una provincia en cualquiera de los rankings para ver su
          resumen.
        </p>
      )}
    </div>
  );
}
