import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SeriesConfig {
  key: string;
  label: string;
  color: string;
  unit: string;
}

interface TimelineChartProps {
  title: string;
  subtitle?: string;
  data: object[];
  series: SeriesConfig[];
  valueFormatter: (value: number, unit: string) => string;
  height?: number;
  yTickFormatter?: (value: number) => string;
}

function defaultYTick(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function TimelineChart({
  title,
  subtitle,
  data,
  series,
  valueFormatter,
  height = 260,
  yTickFormatter = defaultYTick,
}: TimelineChartProps) {
  return (
    <section className="card chart-card">
      <header className="card__header">
        <h3 className="card__title">{title}</h3>
        {subtitle ? <p className="card__subtitle">{subtitle}</p> : null}
      </header>
      <div className="chart-card__canvas" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 18, bottom: 4, left: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#ece7df"
            />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={{ stroke: "#dcd6cc" }}
              tick={{ fontSize: 12, fill: "#6f6a63" }}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6f6a63" }}
              tickFormatter={(value) => yTickFormatter(Number(value))}
              width={68}
            />
            <Tooltip
              formatter={(value, name) => {
                const config = series.find((item) => item.label === name);
                const unit = config?.unit ?? "";
                return [valueFormatter(Number(value), unit), name];
              }}
              labelFormatter={(label) => `Año ${label}`}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e6e0d6",
                boxShadow: "0 4px 14px rgba(43, 34, 28, 0.08)",
                fontSize: 13,
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={28}
              formatter={(value) => <span className="chart-legend">{value}</span>}
            />
            {series.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={2.2}
                dot={{ r: 2.5, strokeWidth: 0, fill: item.color }}
                activeDot={{ r: 5 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
