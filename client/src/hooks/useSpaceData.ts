import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import type {
  HealthResponse,
  ISSData,
  ISSTrend,
  OSDRItem,
  SpaceCache,
  SpaceSummary,
} from "../types/api";
export const QUERY_KEYS = {
  health: ["health"] as const,
  issLast: ["iss", "last"] as const,
  issTrend: ["iss", "trend"] as const,
  osdrList: (limit?: number) => ["osdr", "list", { limit }] as const,
  spaceData: (src: string) => ["space", src] as const,
  spaceSummary: ["space", "summary"] as const,
};

export const useHealth = () =>
  useQuery<HealthResponse>({
    queryKey: QUERY_KEYS.health,
    queryFn: apiService.health,
    refetchInterval: 30000,
    staleTime: 15000,
  });

export const useLastISS = () =>
  useQuery<ISSData>({
    queryKey: QUERY_KEYS.issLast,
    queryFn: apiService.getLastISS,
    refetchInterval: 10000,
    staleTime: 5000,
  });

export const useISSTrend = () =>
  useQuery<ISSTrend>({
    queryKey: QUERY_KEYS.issTrend,
    queryFn: apiService.getISSTrend,
    refetchInterval: 15000,
    staleTime: 7000,
  });

export const useOSDRList = (limit?: number) =>
  useQuery<{ items: OSDRItem[] }>({
    queryKey: QUERY_KEYS.osdrList(limit),
    queryFn: () => apiService.getOSDRList(limit),
    staleTime: 60000,
  });

export const useSpaceData = (source: string) =>
  useQuery<SpaceCache>({
    queryKey: QUERY_KEYS.spaceData(source),
    queryFn: () => apiService.getSpaceData(source),
  });

export const useSpaceSummary = () =>
  useQuery<SpaceSummary>({
    queryKey: QUERY_KEYS.spaceSummary,
    queryFn: apiService.getSpaceSummary,
    refetchInterval: 60000,
    staleTime: 30000,
  });

export const useRefreshData = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sources: string[]) => apiService.refreshSpaceData(sources),
    onSuccess: (_data, variables) => {
      variables.forEach((s) => {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.spaceData(s) });
      });

      qc.invalidateQueries({ queryKey: QUERY_KEYS.spaceSummary });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.issLast });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.issTrend });
    },
  });
};
