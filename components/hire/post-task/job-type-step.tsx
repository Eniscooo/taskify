"use client";

import { SERVICE_CATEGORY_ICONS } from "@/components/marketplace/category-icons";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { StepProps } from "./types";

export function JobTypeStep({ form, set, errors }: StepProps) {
  return (
    <fieldset aria-describedby={errors.service ? "service-error" : undefined}>
      <legend className="mb-4 text-xl font-bold">What kind of job?</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SERVICE_CATEGORIES.map((c) => {
          const Icon = SERVICE_CATEGORY_ICONS[c.id];
          const selected = form.service === c.id;
          return (
            <label
              key={c.id}
              className={cn(
                "flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand",
                selected ? "border-brand bg-brand-soft text-brand-dark" : "border-border bg-surface hover:border-brand/40",
              )}
            >
              <input
                type="radio"
                name="service"
                value={c.id}
                checked={selected}
                onChange={() => set({ service: c.id })}
                className="sr-only"
              />
              <Icon aria-hidden className={cn("h-7 w-7", selected ? "text-brand" : "text-muted")} strokeWidth={1.8} />
              {c.label}
            </label>
          );
        })}
      </div>
      {errors.service && (
        <p id="service-error" role="alert" className="mt-3 text-sm font-medium text-danger">
          {errors.service}
        </p>
      )}
    </fieldset>
  );
}
