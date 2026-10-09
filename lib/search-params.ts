import type { ListingFilters } from "./api";
import type { SortOption } from "./constants";
import type { Area, Condition, DeliveryMethod, ListingCategory } from "./types";

type ParamsLike = { get(key: string): string | null };

export function filtersFromParams(params: ParamsLike): ListingFilters {
  const num = (k: string) => {
    const v = params.get(k);
    return v ? Number(v) : undefined;
  };
  return {
    q: params.get("q") ?? undefined,
    category: (params.get("category") as ListingCategory) ?? undefined,
    area: (params.get("area") as Area) ?? undefined,
    condition: (params.get("condition") as Condition) ?? undefined,
    delivery: (params.get("delivery") as DeliveryMethod) ?? undefined,
    sort: (params.get("sort") as SortOption) ?? undefined,
    minPrice: num("min"),
    maxPrice: num("max"),
  };
}

export function filtersToQuery(f: ListingFilters, omit: (keyof ListingFilters)[] = []) {
  const params = new URLSearchParams();
  const entries: [string, unknown][] = [
    ["q", f.q],
    ["category", f.category],
    ["area", f.area],
    ["condition", f.condition],
    ["delivery", f.delivery],
    ["sort", f.sort === "recommended" ? undefined : f.sort],
    ["min", f.minPrice],
    ["max", f.maxPrice],
  ];
  const keyMap: Record<string, keyof ListingFilters> = { min: "minPrice", max: "maxPrice" };
  for (const [k, v] of entries) {
    if (v == null || v === "" || omit.includes(keyMap[k] ?? (k as keyof ListingFilters))) continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}
