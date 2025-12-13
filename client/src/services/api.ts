import axios from "axios";
import type {
  HealthResponse,
  ISSData,
  ISSTrend,
  OSDRItem,
  SpaceCache,
  SpaceSummary,
} from "../types/api";

import type { AxiosResponse } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

const unwrap = <T>(p: Promise<AxiosResponse<T>>): Promise<T> =>
  p.then((r) => r.data);

export const apiService = {
  health: (): Promise<HealthResponse> => unwrap(api.get("/health")),

  getLastISS: (): Promise<ISSData> => unwrap(api.get("/last")),
  triggerISSFetch: (): Promise<ISSData> => unwrap(api.get("/fetch")),
  getISSTrend: (): Promise<ISSTrend> => unwrap(api.get("/iss/trend")),

  syncOSDR: (): Promise<{ written: number }> => unwrap(api.get("/osdr/sync")),
  getOSDRList: (limit?: number): Promise<{ items: OSDRItem[] }> =>
    unwrap(api.get("/osdr/list", { params: { limit } })),

  getSpaceData: (source: string): Promise<SpaceCache> =>
    unwrap(api.get(`/space/${encodeURIComponent(source)}/latest`)),
  refreshSpaceData: (sources: string[]): Promise<{ refreshed: string[] }> =>
    unwrap(api.get("/space/refresh", { params: { src: sources.join(",") } })),
  getSpaceSummary: (): Promise<SpaceSummary> =>
    unwrap(api.get("/space/summary")),
};
