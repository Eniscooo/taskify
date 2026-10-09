"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** Accessible 1–5 star picker built on a radio group. */
export function RatingInput({
  name,
  label,
  value,
  onChange,
  size = "lg",
}: {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  size?: "md" | "lg";
}) {
  const px = size === "lg" ? "h-9 w-9" : "h-6 w-6";
  return (
    <fieldset>
      <legend className={cn("font-semibold", size === "lg" ? "sr-only" : "mb-1 text-sm")}>{label}</legend>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer rounded-md p-0.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand">
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="sr-only"
            />
            <Star
              aria-hidden
              className={cn(px, "transition-transform active:scale-90", n <= value ? "fill-accent text-accent" : "text-border")}
            />
            <span className="sr-only">
              {n} star{n > 1 ? "s" : ""}, {LABELS[n]}
            </span>
          </label>
        ))}
        {value > 0 && <span className="ml-2 text-sm font-semibold text-muted">{LABELS[value]}</span>}
      </div>
    </fieldset>
  );
}
