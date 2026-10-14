export interface NationalSummary {
  year: number;
  surfaceHa: number | null;
  productionQuintals: number | null;
  surfaceChangePct: number | null;
  productionChangePct: number | null;
}

export interface NationalEvolutionPoint {
  year: number;
  surfaceHa: number | null;
  productionQuintals: number | null;
  surfaceYoYPct: number | null;
  productionYoYPct: number | null;
}

export interface Province {
  provinceId: string;
  province: string;
  surfaceHa: number | null;
  productionQuintals: number | null;
  surfaceSharePct: number | null;
  productionSharePct: number | null;
  productionSurfaceRatio: number | null;
}

export interface ProvincesResponse {
  year: number;
  provinces: Province[];
}

export interface ProvinceSummary {
  year: number;
  provinceId: string;
  province: string;
  surfaceHa: number | null;
  productionQuintals: number | null;
  surfaceSharePct: number | null;
  productionSharePct: number | null;
  productionSurfaceRatio: number | null;
}

export interface ProvinceHistoryPoint {
  year: number;
  surfaceHa: number | null;
  productionQuintals: number | null;
}

export interface ProvinceHistory {
  provinceId: string;
  province: string;
  history: ProvinceHistoryPoint[];
}

export interface Department {
  departmentId: string;
  department: string;
  surfaceHa: number | null;
  productionQuintals: number | null;
  surfaceSharePct: number | null;
  productionSharePct: number | null;
}

export interface DepartmentsResponse {
  year: number;
  provinceId: string;
  province: string;
  departments: Department[];
}

export type Metric = "surface" | "production";
