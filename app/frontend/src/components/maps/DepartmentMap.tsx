import { useEffect } from "react";
import L from "leaflet";
import { GeoJSON, MapContainer, useMap } from "react-leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { PathOptions } from "leaflet";

import type { Department, Metric } from "../../types";
import {
  METRIC_LABELS,
  METRIC_UNITS,
  MISSING_COLOR,
  colorForValue,
  scaleForMetric,
} from "../../theme";
import { formatHectares, formatQuintalsFull, formatShare } from "../../utils/format";

interface DepartmentGeoProperties {
  id: string;
  nombre: string;
}

interface DepartmentMapProps {
  data: FeatureCollection;
  departments: Department[];
  metric: Metric;
  selectedId: string | null;
  onSelect: (departmentId: string) => void;
}

function FitBounds({ data }: { data: FeatureCollection }) {
  const map = useMap();

  useEffect(() => {
    const layer = L.geoJSON(data);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [18, 18] });
    }
  }, [data, map]);

  return null;
}

export function DepartmentMap({
  data,
  departments,
  metric,
  selectedId,
  onSelect,
}: DepartmentMapProps) {
  const byId = new Map(departments.map((item) => [item.departmentId, item]));
  const scale = scaleForMetric(metric);
  const max = departments.reduce((acc, item) => {
    const value =
      metric === "surface" ? item.surfaceHa : item.productionQuintals;
    return value !== null && value > acc ? value : acc;
  }, 0);
  const unit = METRIC_UNITS[metric];

  const valueOf = (department: Department | undefined): number | null => {
    if (!department) {
      return null;
    }
    return metric === "surface"
      ? department.surfaceHa
      : department.productionQuintals;
  };

  const shareOf = (department: Department | undefined): number | null => {
    if (!department) {
      return null;
    }
    return metric === "surface"
      ? department.surfaceSharePct
      : department.productionSharePct;
  };

  const formatValue = (value: number | null): string =>
    metric === "surface" ? formatHectares(value) : formatQuintalsFull(value);

  const buildTooltip = (feature: Feature<Geometry, DepartmentGeoProperties>) => {
    const id = String(feature.properties.id);
    const department = byId.get(id);
    const value = valueOf(department);
    const share = shareOf(department);
    const name = department?.department ?? feature.properties.nombre ?? id;
    const valueText =
      value === null
        ? "Sin dato disponible"
        : `${formatValue(value)}`;
    const shareText = value === null ? "" : formatShare(share);
    return `
      <div class="map-tooltip">
        <p class="map-tooltip__name">${name}</p>
        <p class="map-tooltip__label">${METRIC_LABELS[metric]} (${
          metric === "surface" ? "ha" : "qq"
        })</p>
        <p class="map-tooltip__value">${valueText}</p>
        ${
          shareText
            ? `<p class="map-tooltip__share">Participación provincial ${shareText}</p>`
            : ""
        }
      </div>
    `;
  };

  const styleFor = (
    feature?: Feature<Geometry, DepartmentGeoProperties>
  ): PathOptions => {
    const id = feature ? String(feature.properties.id) : "";
    const department = byId.get(id);
    const value = valueOf(department);
    const isSelected = id === selectedId;
    const fill =
      value === null ? MISSING_COLOR : colorForValue(value, max, scale);
    return {
      fillColor: fill,
      fillOpacity: value === null ? 0.75 : 0.9,
      color: isSelected ? "#2b2320" : "#ffffff",
      weight: isSelected ? 3 : 1,
      dashArray: value === null ? "4 3" : undefined,
    };
  };

  return (
    <div className="map" aria-label={`Mapa de departamentos, ${METRIC_LABELS[metric].toLowerCase()}`}>
      <MapContainer
        center={[-38, -63]}
        zoom={5}
        className="map__canvas"
        zoomControl
        attributionControl={false}
        scrollWheelZoom
      >
        <FitBounds data={data} />
        <GeoJSON
          key={`${metric}-${selectedId}`}
          data={data}
          style={styleFor}
          onEachFeature={(feature, layer) => {
            const typed = feature as Feature<Geometry, DepartmentGeoProperties>;
            const id = String(typed.properties.id);
            layer.bindTooltip(buildTooltip(typed), {
              sticky: true,
              direction: "top",
              opacity: 0.97,
              className: "map-tooltip",
            });
            layer.on("click", () => onSelect(id));
          }}
        />
      </MapContainer>
      <MapLegend metric={metric} max={max} scale={scale} unit={unit} />
    </div>
  );
}

interface MapLegendProps {
  metric: Metric;
  max: number;
  scale: string[];
  unit: string;
}

function MapLegend({ metric, max, scale, unit }: MapLegendProps) {
  const label = METRIC_LABELS[metric];
  return (
    <div className="map-legend">
      <p className="map-legend__title">{label}</p>
      <div className="map-legend__scale">
        <div className="map-legend__gradient">
          {scale.map((color) => (
            <span
              key={color}
              className="map-legend__step"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="map-legend__bounds">
          <span>0 {unit}</span>
          <span>
            {new Intl.NumberFormat("es-AR", {
              maximumFractionDigits: 0,
            }).format(Math.round(max))}{" "}
            {unit}
          </span>
        </div>
      </div>
      <div className="map-legend__missing">
        <span
          className="map-legend__swatch"
          style={{ backgroundColor: MISSING_COLOR }}
        />
        <span>Sin dato</span>
      </div>
    </div>
  );
}
