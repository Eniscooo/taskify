"use client";

import { X } from "lucide-react";
import type { ListingFilters } from "@/lib/api";
import { SORT_OPTIONS } from "@/lib/constants";
import { categoryLabel, conditionLabel, deliveryLabel, formatCompactNaira } from "@/lib/formatters";

/** Removable pills summarising the active filters. */
export function ActiveFilters({
  filters,
  onChange,
  hideCategory,
}: {
  filters: ListingFilters;
  onChange: (f: ListingFilters) => void;
  hideCategory?: boolean;
}) {
  const pills: { key: string; label: string; clear: Partial<ListingFilters> }[] = [];
  if (filters.category && !hideCategory)
    pills.push({ key: "category", label: categoryLabel(filters.category), clear: { category: undefined } });
  if (filters.area) pills.push({ key: "area", label: filters.area, clear: { area: undefined } });
  if (filters.minPrice != null || filters.maxPrice != null) {
    const label =
      filters.minPrice != null && filters.maxPrice != null
        ? `${formatCompactNaira(filters.minPrice)}–${formatCompactNaira(filters.maxPrice)}`
        : filters.minPrice != null
          ? `From ${formatCompactNaira(filters.minPrice)}`
          : `Up to ${formatCompactNaira(filters.maxPrice!)}`;
    pills.push({ key: "price", label, clear: { minPrice: undefined, maxPrice: undefined } });
  }
  if (filters.condition)
    pills.push({ key: "condition", label: conditionLabel(filters.condition), clear: { condition: undefined } });
  if (filters.delivery)
    pills.push({ key: "delivery", label: deliveryLabel(filters.delivery), clear: { delivery: undefined } });
  if (filters.sort && filters.sort !== "recommended")
    pills.push({
      key: "sort",
      label: SORT_OPTIONS.find((s) => s.id === filters.sort)!.label,
      clear: { sort: undefined },
    });

  if (!pills.length) return null;
  return (
    <ul aria-label="Active filters" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
      {pills.map((p) => (
        <li key={p.key}>
          <button
            type="button"
            onClick={() => onChange({ ...filters, ...p.clear })}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-brand-soft pr-2 pl-3 text-xs font-semibold whitespace-nowrap text-brand-dark focus-visible:outline-2 focus-visible:outline-brand"
          >
            {p.label}
            <X aria-hidden className="h-3.5 w-3.5" />
            <span className="sr-only">Remove filter</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
