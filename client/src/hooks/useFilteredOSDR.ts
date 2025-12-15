import { useMemo } from "react";
import type { OSDRItem } from "../types/api";
import { extractOSDRData } from "../utils/osdr";

export const useFilteredOSDR = (
  items: OSDRItem[] | undefined,
  searchQuery: string,
  searchField: "all" | "dataset_id" | "title"
) => {
  return useMemo(() => {
    if (!items) return [];
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase().trim();

    return items.filter((item) => {
      const extracted = extractOSDRData(item);

      switch (searchField) {
        case "dataset_id":
          return extracted.dataset_id.toLowerCase().includes(query);
        case "title":
          return extracted.title.toLowerCase().includes(query);
        case "all":
        default:
          return (
            extracted.dataset_id.toLowerCase().includes(query) ||
            extracted.title.toLowerCase().includes(query) ||
            extracted.rest_url.toLowerCase().includes(query)
          );
      }
    });
  }, [items, searchQuery, searchField]);
};
