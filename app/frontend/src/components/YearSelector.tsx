export const MIN_YEAR = 2012;
export const MAX_YEAR = 2024;
export const DEFAULT_YEAR = 2024;

export const AVAILABLE_YEARS: number[] = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, index) => MIN_YEAR + index
);

export function clampYear(value: number): number {
  if (!Number.isFinite(value) || value < MIN_YEAR || value > MAX_YEAR) {
    return DEFAULT_YEAR;
  }
  return Math.trunc(value);
}

interface YearSelectorProps {
  year: number;
  onChange: (year: number) => void;
}

export function YearSelector({ year, onChange }: YearSelectorProps) {
  return (
    <label className="control control--year">
      <span className="control__label">Año</span>
      <select
        className="control__select"
        value={year}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {AVAILABLE_YEARS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
