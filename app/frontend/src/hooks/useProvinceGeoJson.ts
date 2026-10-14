import { useEffect, useState } from "react";
import type { FeatureCollection } from "geojson";

interface GeoState {
  data: FeatureCollection | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useProvinceGeoJson(provinceId: string): GeoState {
  const [data, setData] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const base = import.meta.env.BASE_URL ?? "/";
    fetch(`${base}geo/departments/${provinceId}.geojson`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("not found");
        }
        return response.json() as Promise<FeatureCollection>;
      })
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setError(
            "No fue posible cargar la cartografía de la provincia seleccionada."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [provinceId, nonce]);

  return { data, loading, error, reload: () => setNonce((value) => value + 1) };
}
