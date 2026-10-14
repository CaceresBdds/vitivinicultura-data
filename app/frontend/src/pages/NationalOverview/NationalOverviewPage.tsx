import { TimelineChart } from "../../components/charts/TimelineChart";
import { IndicatorCard } from "../../components/IndicatorCard";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/StateViews";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";
import { METRIC_COLORS, METRIC_LABELS } from "../../theme";
import {
  formatHectares,
  formatInteger,
  formatPercent,
  formatQuintals,
  formatQuintalsFull,
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

export function NationalOverviewPage() {
  const summary = useApi(() => api.getNationalSummary(), []);
  const evolution = useApi(() => api.getNationalEvolution(), []);

  if (summary.loading || evolution.loading) {
    return (
      <div className="page">
        <LoadingState />
      </div>
    );
  }

  const error = summary.error ?? evolution.error;
  if (error) {
    return (
      <div className="page">
        <ErrorState
          message={error}
          onRetry={() => {
            summary.reload();
            evolution.reload();
          }}
        />
      </div>
    );
  }

  const data = summary.data;
  const evolutionData = evolution.data;
  if (!data || !evolutionData || evolutionData.length === 0) {
    return (
      <div className="page">
        <EmptyState />
      </div>
    );
  }

  const variationData = evolutionData.filter((point) => point.year >= 2013);

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Panorama nacional</h1>
        <p className="page__subtitle">
          Superficie implantada y producción de uva en Argentina (2012-2024)
        </p>
      </header>

      <section className="indicators-grid" aria-label="Indicadores nacionales">
        <IndicatorCard
          label="Superficie implantada"
          value={formatHectares(data.surfaceHa)}
          context="2024"
          tone="surface"
        />
        <IndicatorCard
          label="Cambio de superficie"
          value={formatPercent(data.surfaceChangePct)}
          context="2012 → 2024"
          tone="surface"
        />
        <IndicatorCard
          label="Producción de uva"
          value={formatQuintals(data.productionQuintals)}
          context="2024"
          tone="production"
        />
        <IndicatorCard
          label="Cambio de producción"
          value={formatPercent(data.productionChangePct)}
          context="2012 → 2024"
          tone="production"
        />
      </section>

      <section className="charts-grid charts-grid--two">
        <TimelineChart
          title="Evolución de superficie"
          subtitle="Hectáreas implantadas por año"
          data={evolutionData}
          series={[
            {
              key: "surfaceHa",
              label: METRIC_LABELS.surface,
              color: METRIC_COLORS.surface,
              unit: "ha",
            },
          ]}
          valueFormatter={formatChartValue}
        />
        <TimelineChart
          title="Evolución de producción"
          subtitle="Quintales de uva por año"
          data={evolutionData}
          series={[
            {
              key: "productionQuintals",
              label: METRIC_LABELS.production,
              color: METRIC_COLORS.production,
              unit: "qq",
            },
          ]}
          valueFormatter={formatChartValue}
        />
      </section>

      <section className="charts-grid">
        <TimelineChart
          title="Variación interanual"
          subtitle="Superficie vs producción (2013-2024)"
          data={variationData}
          series={[
            {
              key: "surfaceYoYPct",
              label: "Superficie",
              color: METRIC_COLORS.surface,
              unit: "%",
            },
            {
              key: "productionYoYPct",
              label: "Producción",
              color: METRIC_COLORS.production,
              unit: "%",
            },
          ]}
          valueFormatter={formatChartValue}
          yTickFormatter={(value) => `${value}%`}
        />
      </section>
    </div>
  );
}
