export interface RankingItem {
  id: string;
  name: string;
  value: number | null;
  sharePct: number | null;
}

interface RankingBarsProps {
  items: RankingItem[];
  color: string;
  formatValue: (value: number | null) => string;
  formatShare: (value: number | null) => string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  valueHeading: string;
  ariaLabel: string;
}

export function RankingBars({
  items,
  color,
  formatValue,
  formatShare,
  selectedId,
  onSelect,
  valueHeading,
  ariaLabel,
}: RankingBarsProps) {
  const max = items.reduce(
    (acc, item) => (item.value !== null && item.value > acc ? item.value : acc),
    0
  );

  return (
    <div className="ranking" role="list" aria-label={ariaLabel}>
      <div className="ranking__header" aria-hidden="true">
        <span className="ranking__header-name">Territorio</span>
        <span className="ranking__header-bar" />
        <span className="ranking__header-value">{valueHeading}</span>
        <span className="ranking__header-share">Participación</span>
      </div>
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        const isMissing = item.value === null || item.value === undefined;
        const width = isMissing || max <= 0 ? 0 : (item.value! / max) * 100;
        return (
          <button
            key={item.id}
            type="button"
            role="listitem"
            className={`ranking__row${isSelected ? " ranking__row--selected" : ""}${
              onSelect ? " ranking__row--clickable" : ""
            }`}
            onClick={onSelect ? () => onSelect(item.id) : undefined}
            aria-pressed={onSelect ? isSelected : undefined}
            title={`${item.name}: ${formatValue(item.value)}${
              isMissing ? "" : ` · ${formatShare(item.sharePct)}`
            }`}
          >
            <span className="ranking__name">{item.name}</span>
            <span className="ranking__bar">
              {isMissing ? (
                <span className="ranking__missing">Sin dato</span>
              ) : (
                <span
                  className="ranking__fill"
                  style={{ width: `${width}%`, backgroundColor: color }}
                />
              )}
            </span>
            <span className="ranking__value">{formatValue(item.value)}</span>
            <span className="ranking__share">
              {isMissing ? "—" : formatShare(item.sharePct)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
