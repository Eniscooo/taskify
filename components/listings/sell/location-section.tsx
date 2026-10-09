"use client";

import { FormSection, OptionCards } from "@/components/forms/form-section";
import { Field, Select } from "@/components/ui/field";
import { AREAS, DELIVERY_METHODS } from "@/lib/constants";
import type { Errors, ListingDraft } from "@/lib/validation";
import type { SellFormState } from "./types";

const DELIVERY_HINTS: Record<string, string> = {
  pickup: "Buyer comes to you",
  "seller-delivers": "You arrange delivery",
  both: "Buyer chooses",
};

export function LocationSection({
  form,
  set,
  errors,
}: {
  form: SellFormState;
  set: (patch: Partial<SellFormState>) => void;
  errors: Errors<keyof ListingDraft>;
}) {
  return (
    <FormSection step={4} title="Location & delivery" description="We only show your area, never your address.">
      <Field label="Area" htmlFor="area" error={errors.area}>
        <Select id="area" value={form.area} invalid={!!errors.area} onChange={(e) => set({ area: e.target.value })}>
          <option value="">Choose your area</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}, Lagos
            </option>
          ))}
        </Select>
      </Field>
      <OptionCards
        name="delivery"
        legend="How will the buyer get it?"
        columns={3}
        options={DELIVERY_METHODS.map((d) => ({ ...d, description: DELIVERY_HINTS[d.id] }))}
        value={form.delivery}
        error={errors.delivery}
        onChange={(delivery) => set({ delivery })}
      />
    </FormSection>
  );
}
