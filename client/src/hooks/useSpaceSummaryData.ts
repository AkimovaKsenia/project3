import type { SpaceSummary } from "../types/api";

export const useSpaceSummaryData = (summary: SpaceSummary) => {
  const safeGet = (obj: any, path: string, defaultValue: any = null) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj) ?? defaultValue;

  const apodTitle = safeGet(summary.apod, "payload.title");
  const apodUrl = safeGet(summary.apod, "payload.url");
  const apodThumbUrl = safeGet(summary.apod, "payload.thumbnail_url");

  const neoCount = safeGet(summary.neo, "payload.element_count", 0);

  const flrCount = Array.isArray(summary.flr.payload)
    ? summary.flr.payload.length
    : summary.flr.payload
    ? 1
    : 0;

  const cmeCount = Array.isArray(summary.cme.payload)
    ? summary.cme.payload.length
    : summary.cme.payload
    ? 1
    : 0;

  const spacexName = safeGet(summary.spacex, "payload.name", "Нет данных");
  const spacexDate = safeGet(summary.spacex, "payload.date_utc");

  const issData = summary.iss?.payload || {};
  const issAltitude = safeGet(issData, "altitude", 0);
  const issVelocity = safeGet(issData, "velocity", 0);

  const osdrCount = summary.osdr_count || 0;

  const updateTime = summary.iss?.at
    ? new Date(summary.iss.at).toLocaleTimeString("ru-RU")
    : new Date().toLocaleTimeString("ru-RU");

  return {
    apodTitle,
    apodUrl,
    apodThumbUrl,
    neoCount,
    flrCount,
    cmeCount,
    spacexName,
    spacexDate,
    issAltitude,
    issVelocity,
    osdrCount,
    updateTime,
  };
};
