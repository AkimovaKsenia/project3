export const extractOSDRData = (item: any) => {
  const raw = item.raw || {};

  return {
    dataset_id: item.dataset_id || "N/A",
    title: item.dataset_id || "Без названия",
    status: "available",
    updated_at: item.updated_at || null,
    rest_url: raw.REST_URL || "",
  };
};
