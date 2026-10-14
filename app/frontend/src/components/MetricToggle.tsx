import type { Metric } from "../types";
import { METRIC_LABELS } from "../theme";

interface MetricToggleProps {
  metric: Metric;
  onChange: (metric: Metric) => void;
}

const METRICS: Metric[] = ["surface", "production"];

export function MetricToggle({ metric, onChange }: MetricToggleProps) {
  return (
    <div className="segmented" role="group" aria-label="Métrica">
      {METRICS.map((option) => (
        <button
          key={option}
          type="button"
          className={`segmented__button${
            metric === option ? " segmented__button--active" : ""
          }`}
          aria-pressed={metric === option}
          onClick={() => onChange(option)}
        >
          {METRIC_LABELS[option]}
        </button>
      ))}
    </div>
  );
}
