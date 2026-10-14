interface IndicatorCardProps {
  label: string;
  value: string;
  unit?: string;
  context?: string;
  tone?: "neutral" | "surface" | "production";
}

export function IndicatorCard({
  label,
  value,
  unit,
  context,
  tone = "neutral",
}: IndicatorCardProps) {
  return (
    <article className={`indicator indicator--${tone}`}>
      <p className="indicator__label">{label}</p>
      <p className="indicator__value">
        {value}
        {unit ? <span className="indicator__unit"> {unit}</span> : null}
      </p>
      {context ? <p className="indicator__context">{context}</p> : null}
    </article>
  );
}
