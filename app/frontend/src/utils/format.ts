const integerFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatInteger(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return integerFormatter.format(value);
}

export function formatDecimal(
  value: number | null | undefined,
  digits = 2
): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatHectares(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "Sin dato";
  }
  return `${integerFormatter.format(Math.round(value))} ha`;
}

export function formatQuintals(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "Sin dato";
  }
  if (Math.abs(value) >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(millions)} M qq`;
  }
  return `${integerFormatter.format(Math.round(value))} qq`;
}

export function formatQuintalsFull(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "Sin dato";
  }
  return `${integerFormatter.format(Math.round(value))} qq`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  const formatted = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatted} %`;
}

export function formatShare(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "Sin dato";
  }
  return `${decimalFormatter.format(value)} %`;
}

export function formatRatio(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "Sin dato";
  }
  return `${decimalFormatter.format(value)} qq/ha`;
}
