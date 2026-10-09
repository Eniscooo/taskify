"use client";

import { Input } from "@/components/ui/field";
import { Chip } from "@/components/ui/chip";

const PRESETS = [
  { label: "Under ₦50k", max: 50_000 },
  { label: "₦50k–₦300k", min: 50_000, max: 300_000 },
  { label: "₦300k–₦1M", min: 300_000, max: 1_000_000 },
  { label: "Above ₦1M", min: 1_000_000 },
];

export function PriceRange({
  min,
  max,
  onChange,
}: {
  min?: number;
  max?: number;
  onChange: (range: { min?: number; max?: number }) => void;
}) {
  const parse = (v: string) => {
    const n = Number(v.replace(/[^\d]/g, ""));
    return v && !Number.isNaN(n) ? n : undefined;
  };

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">Price range</legend>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="price-min" className="sr-only">
            Minimum price in Naira
          </label>
          <Input
            id="price-min"
            inputMode="numeric"
            prefix="₦"
            placeholder="Min"
            value={min ?? ""}
            onChange={(e) => onChange({ min: parse(e.target.value), max })}
          />
        </div>
        <div>
          <label htmlFor="price-max" className="sr-only">
            Maximum price in Naira
          </label>
          <Input
            id="price-max"
            inputMode="numeric"
            prefix="₦"
            placeholder="Max"
            value={max ?? ""}
            onChange={(e) => onChange({ min, max: parse(e.target.value) })}
          />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = p.min === min && p.max === max;
          return (
            <Chip
              key={p.label}
              active={active}
              className="h-9 px-3 text-xs"
              onClick={() => onChange(active ? {} : { min: p.min, max: p.max })}
            >
              {p.label}
            </Chip>
          );
        })}
      </div>
    </fieldset>
  );
}
