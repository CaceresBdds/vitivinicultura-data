import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { TimelineChart } from "../../components/charts/TimelineChart";
import { IndicatorCard } from "../../components/IndicatorCard";
import { MetricToggle } from "../../components/MetricToggle";
import { DepartmentMap } from "../../components/maps/DepartmentMap";
import { RankingBars, type RankingItem } from "../../components/RankingBars";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/StateViews";
import { YearSelector, clampYear } from "../../components/YearSelector";
import { useApi } from "../../hooks/useApi";
import { useProvinceGeoJson } from "../../hooks/useProvinceGeoJson";
import { api } from "../../services/api";
import { METRIC_COLORS, METRIC_LABELS } from "../../theme";
import type { Department, Metric } from "../../types";
import {
  formatHectares,
  formatInteger,
  formatQuintals,
  formatQuintalsFull,
  formatRatio,
  formatShare,
} from "../../utils/format";

function formatChartValue(value: number, unit: string): string {
  if (unit === "%") {
    return `${new Intl.NumberFormat("es-AR", {
      maximumFractionDigits: 2,
    }).format(value)} %`;
  }
  if (unit === "ha") {
    return `${formatInteger(value)} ha`;
  }
  return formatQuintalsFull(value);
}

function departmentValue(
  department: Department,
  metric: Metric
): number | null {
  return metric === "surface"
    ? department.surfaceHa
    : department.productionQuintals;
}

function departmentShare(
  department: Department,
  metric: Metric
): number | null {
  return metric === "surface"
    ? department.surfaceSharePct
    : department.productionSharePct;
}

function toDepartmentRanking(
  departments: Department[],
  metric: Metric
): RankingItem[] {
  return [...departments]
    .sort(
      (a, b) =>
        (departmentValue(b, metric) ?? -Infinity) -
        (departmentValue(a, metric) ?? -Infinity)
    )
    .map((department) => ({
      id: department.departmentId,
      name: department.department,
      value: departmentValue(department, metric),
      sharePct: departmentShare(department, metric),
    }));
}

export function ProvinceDetailPage() {
  const { provinceId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const year = clampYear(Number(searchParams.get("year")));
  const [metric, setMetric] = useState<Metric>("surface");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );

  const summary = useApi(
    () => api.getProvinceSummary(provinceId, year),
    [provinceId, year]
  );
  const departments = useApi(
    () => api.getProvinceDepartments(provinceId, year),
    [provinceId, year]
  );
  const history = useApi(
    () => api.getProvinceHistory(provinceId),
    [provinceId]
  );
  const geo = useProvinceGeoJson(provinceId);

  const handleYearChange = (value: number) => {
    setSearchParams({ year: String(value) });
  };

  if (summary.loading || departments.loading) {
    return (
      <div className="page">
        <LoadingState />
      </div>
    );
  }

  const error = summary.error ?? departments.error;
  if (error) {
    return (
      <div className="page">
        <ErrorState
          message={error}
          onRetry={() => {
            summary.reload();
            departments.reload();
          }}
        />
      </div>
    );
  }

  if (!summary.data || !departments.data) {
    return (
      <div className="page">
        <EmptyState />
      </div>
    );
  }

  const province = summary.data;
  const departmentList = departments.data.departments;
  const rankingItems = toDepartmentRanking(departmentList, metric);
  const historyData = history.data?.history ?? [];

  return (
    <div className="page">
      <header className="page__header page__header--row">
        <div>
          <Link className="back-link" to={`/provinces?year=${year}`}>
            ← Volver a provincias
          </Link>
          <h1 className="page__title">{province.province}</h1>
          <p className="page__subtitle">Detalle provincial</p>
        </div>
        <YearSelector year={year} onChange={handleYearChange} />
      </header>

      <section className="indicators-grid indicators-grid--five">
        <IndicatorCard
          label="Superficie implantada"
          value={formatHectares(province.surfaceHa)}
          context={String(year)}
          tone="surface"
        />
        <IndicatorCard
          label="Producción de uva"
          value={formatQuintals(province.productionQuintals)}
          context={String(year)}
          tone="production"
        />
        <IndicatorCard
          label="Participación superficie"
          value={formatShare(province.surfaceSharePct)}
          tone="surface"
        />
        <IndicatorCard
          label="Participación producción"
          value={formatShare(province.productionSharePct)}
          tone="production"
        />
        <IndicatorCard
          label="Ratio producción/superficie"
          value={formatRatio(province.productionSurfaceRatio)}
        />
      </section>

      {province.productionQuintals === null ? (
        <p className="inline-note">
          Sin dato de producción para {province.province} en {year}.
        </p>
      ) : null}

      <section className="section">
        <h2 className="section__title">Evolución histórica</h2>
        <div className="charts-grid charts-grid--two">
          {history.loading ? (
            <LoadingState label="Cargando evolución…" />
          ) : history.error ? (
            <ErrorState message={history.error} onRetry={history.reload} />
          ) : historyData.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <TimelineChart
                title="Superficie implantada"
                subtitle="Hectáreas por año (2012-2024)"
                data={historyData}
                series={[
                  {
                    key: "surfaceHa",
                    label: METRIC_LABELS.surface,
                    color: METRIC_COLORS.surface,
                    unit: "ha",
                  },
                ]}
                valueFormatter={formatChartValue}
                height={220}
              />
              <TimelineChart
                title="Producción de uva"
                subtitle="Quintales por año (2012-2024)"
                data={historyData}
                series={[
                  {
                    key: "productionQuintals",
                    label: METRIC_LABELS.production,
                    color: METRIC_COLORS.production,
                    unit: "qq",
                  },
                ]}
                valueFormatter={formatChartValue}
                height={220}
              />
            </>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title section__title--accent">
            Análisis departamental
          </h2>
          <MetricToggle metric={metric} onChange={setMetric} />
        </div>

        <div className="department-grid">
          <div className="card map-card">
            {geo.loading ? (
              <LoadingState label="Cargando cartografía…" />
            ) : geo.error ? (
              <ErrorState message={geo.error} onRetry={geo.reload} />
            ) : geo.data ? (
              <DepartmentMap
                data={geo.data}
                departments={departmentList}
                metric={metric}
                selectedId={selectedDepartment}
                onSelect={setSelectedDepartment}
              />
            ) : (
              <EmptyState message="Sin cartografía disponible." />
            )}
          </div>

          <article className="card">
            <header className="card__header">
              <h3 className="card__title">
                {metric === "surface"
                  ? "Superficie implantada por departamento"
                  : "Producción de uva por departamento"}
              </h3>
              <p className="card__subtitle">
                {metric === "surface" ? "Hectáreas" : "Quintales"} · {year}
              </p>
            </header>
            {rankingItems.length === 0 ? (
              <EmptyState />
            ) : (
              <RankingBars
                items={rankingItems}
                color={METRIC_COLORS[metric]}
                formatValue={(value) =>
                  metric === "surface"
                    ? formatHectares(value)
                    : formatQuintals(value)
                }
                formatShare={(value) => formatShare(value)}
                selectedId={selectedDepartment}
                onSelect={setSelectedDepartment}
                valueHeading={
                  metric === "surface" ? "Superficie" : "Producción"
                }
                ariaLabel={`${
                  metric === "surface" ? "Superficie" : "Producción"
                } por departamento en ${year}`}
              />
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
