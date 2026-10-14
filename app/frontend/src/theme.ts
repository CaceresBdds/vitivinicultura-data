import type { Metric } from "./types";

export const METRIC_COLORS: Record<Metric, string> = {
  surface: "#4f7a52",
  production: "#7d2b3c",
};

export const METRIC_LABELS: Record<Metric, string> = {
  surface: "Superficie",
  production: "Producción",
};

export const METRIC_UNITS: Record<Metric, string> = {
  surface: "ha",
  production: "qq",
};

export const SURFACE_SCALE = [
  "#eef4ec",
  "#cfe3cb",
  "#a8cba3",
  "#7cae78",
  "#518e55",
  "#2f6b39",
  "#1b4726",
];

export const PRODUCTION_SCALE = [
  "#f7e9ec",
  "#e8c5cc",
  "#d69aa5",
  "#bd6d7d",
  "#9d4356",
  "#7a2237",
  "#551220",
];

export const MISSING_COLOR = "#d8d8d8";

export function scaleForMetric(metric: Metric): string[] {
  return metric === "surface" ? SURFACE_SCALE : PRODUCTION_SCALE;
}

/**
 * Devuelve el color de la escala para un valor dado. El valor máximo se
 * normaliza al último color de la escala. Los valores ausentes reciben un
 * color distintivo y nunca se interpretan como cero.
 */
export function colorForValue(
  value: number | null,
  max: number,
  scale: string[]
): string {
  if (value === null || value === undefined) {
    return MISSING_COLOR;
  }
  if (max <= 0) {
    return scale[0];
  }
  const ratio = Math.min(Math.max(value / max, 0), 1);
  const index = Math.min(
    Math.floor(ratio * (scale.length - 1)),
    scale.length - 1
  );
  return scale[index];
}
