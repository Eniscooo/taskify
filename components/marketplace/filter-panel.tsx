"use client";

import { Chip } from "@/components/ui/chip";
import { Select } from "@/components/ui/field";
import type { ListingFilters } from "@/lib/api";
import { AREAS, CONDITIONS, DELIVERY_METHODS, LISTING_CATEGORIES, SORT_OPTIONS, type SortOption } from "@/lib/constants";
import type { Area, Condition, DeliveryMethod, ListingCategory } from "@/lib/types";
import { PriceRange } from "./price-range";

export function FilterPanel({
  filters,
  onChange,
  showCategory = true,
}: {
  filters: ListingFilters;
  onChange: (next: ListingFilters) => void;
  showCategory?: boolean;
}) {
  const set = (patch: Partial<ListingFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="filter-sort" className="mb-2 block text-sm font-semibold">
          Sort by
        </label>
        <Select
          id="filter-sort"
          value={filters.sort ?? "recommended"}
          onChange={(e) => set({ sort: e.target.value as SortOption })}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      {showCategory && (
        <div>
          <label htmlFor="filter-category" className="mb-2 block text-sm font-semibold">
            Category
          </label>
          <Select
            id="filter-category"
            value={filters.category ?? ""}
            onChange={(e) => set({ category: (e.target.value || undefined) as ListingCategory | undefined })}
          >
            <option value="">All categories</option>
            {LISTING_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div>
        <label htmlFor="filter-area" className="mb-2 block text-sm font-semibold">
          Location
        </label>
        <Select
          id="filter-area"
          value={filters.area ?? ""}
          onChange={(e) => set({ area: (e.target.value || undefined) as Area | undefined })}
        >
          <option value="">All of Lagos</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>

      <PriceRange
        min={filters.minPrice}
        max={filters.maxPrice}
        onChange={({ min, max }) => set({ minPrice: min, maxPrice: max })}
      />

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Condition</legend>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <Chip
              key={c.id}
              active={filters.condition === c.id}
              className="h-9 px-3 text-xs"
              onClick={() => set({ condition: filters.condition === c.id ? undefined : (c.id as Condition) })}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Delivery</legend>
        <div className="flex flex-wrap gap-2">
          {DELIVERY_METHODS.filter((d) => d.id !== "both").map((d) => (
            <Chip
              key={d.id}
              active={filters.delivery === d.id}
              className="h-9 px-3 text-xs"
              onClick={() => set({ delivery: filters.delivery === d.id ? undefined : (d.id as DeliveryMethod) })}
            >
              {d.label}
            </Chip>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

/** Number of non-default filters, for the "Filters (3)" button. */
export function countActiveFilters(f: ListingFilters, ignoreCategory = false) {
  return [
    !ignoreCategory && f.category,
    f.area,
    f.minPrice != null || f.maxPrice != null,
    f.condition,
    f.delivery,
    f.sort && f.sort !== "recommended",
  ].filter(Boolean).length;
}
