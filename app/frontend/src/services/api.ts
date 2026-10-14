import type {
  DepartmentsResponse,
  NationalEvolutionPoint,
  NationalSummary,
  ProvincesResponse,
  ProvinceHistory,
  ProvinceSummary,
} from "../types";

const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const GENERIC_ERROR =
  "No fue posible cargar la información. Intentá nuevamente.";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  params?: Record<string, string | number>
): Promise<T> {
  const url = new URL(`${API_URL}${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new ApiError(GENERIC_ERROR);
  }

  if (!response.ok) {
    let message = GENERIC_ERROR;
    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) {
        message = body.error;
      }
    } catch {
      // Se conserva el mensaje genérico.
    }
    throw new ApiError(message);
  }

  return (await response.json()) as T;
}

export const api = {
  getNationalSummary: () => request<NationalSummary>("/national/summary"),
  getNationalEvolution: () =>
    request<NationalEvolutionPoint[]>("/national/evolution"),
  getProvinces: (year: number) =>
    request<ProvincesResponse>("/provinces", { year }),
  getProvinceSummary: (provinceId: string, year: number) =>
    request<ProvinceSummary>(`/provinces/${provinceId}/summary`, { year }),
  getProvinceHistory: (provinceId: string) =>
    request<ProvinceHistory>(`/provinces/${provinceId}/history`),
  getProvinceDepartments: (provinceId: string, year: number) =>
    request<DepartmentsResponse>(`/provinces/${provinceId}/departments`, {
      year,
    }),
};

export { API_URL };
