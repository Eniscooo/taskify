"use client";

import { FormSection } from "@/components/forms/form-section";
import { Field, Input } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { PLATFORM_FEE_RATE } from "@/lib/constants";
import { formatNaira, formatNumber } from "@/lib/formatters";
import { digitsOnly, type Errors, type ListingDraft } from "@/lib/validation";
import type { SellFormState } from "./types";

export function PriceSection({
  form,
  set,
  errors,
}: {
  form: SellFormState;
  set: (patch: Partial<SellFormState>) => void;
  errors: Errors<keyof ListingDraft>;
}) {
  const price = Number(form.price) || 0;
  const fee = Math.round(price * PLATFORM_FEE_RATE);

  return (
    <FormSection step={3} title="Price">
      <Field label="Price" htmlFor="price" error={errors.price}>
        <Input
          id="price"
          inputMode="numeric"
          prefix="₦"
          invalid={!!errors.price}
          aria-describedby={errors.price ? "price-error" : undefined}
          value={form.price ? formatNumber(Number(form.price)) : ""}
          onChange={(e) => set({ price: digitsOnly(e.target.value) })}
          placeholder="0"
          className="text-lg font-bold"
        />
      </Field>
      <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm font-medium">
        Open to offers
        <Switch checked={form.negotiable} onChange={(e) => set({ negotiable: e.target.checked })} />
      </label>
      {price > 0 && (
        <p className="rounded-xl bg-background p-3 text-sm text-muted">
          When it sells you&apos;ll receive{" "}
          <strong className="text-foreground">{formatNaira(price - fee)}</strong> after our 5% fee (
          {formatNaira(fee)}). Paid to your bank once the buyer confirms.
        </p>
      )}
    </FormSection>
  );
}
