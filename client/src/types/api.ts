export interface HealthResponse {
  status: string;
  now: string;
}

export interface ISSData {
  id: number;
  fetched_at: string;
  source_url: string;
  payload: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    velocity?: number;
    [key: string]: any;
  };
}

export interface ISSTrend {
  movement: boolean;
  delta_km: number;
  dt_sec: number;
  velocity_kmh?: number | null;
  from_time?: string | null;
  to_time?: string | null;
  from_lat?: number | null;
  from_lon?: number | null;
  to_lat?: number | null;
  to_lon?: number | null;
}

export interface OSDRItem {
  id: number;
  dataset_id?: string | null;
  title?: string | null;
  status?: string | null;
  updated_at?: string | null;
  inserted_at: string;
  raw: any;
}

export interface SpaceCache {
  source: string;
  fetched_at: string;
  payload: any;
}

export interface SpaceSummary {
  apod: { at?: string; payload?: any };
  neo: { at?: string; payload?: any };
  flr: { at?: string; payload?: any };
  cme: { at?: string; payload?: any };
  spacex: { at?: string; payload?: any };
  iss: { at?: string; payload?: any };
  osdr_count: number;
}
