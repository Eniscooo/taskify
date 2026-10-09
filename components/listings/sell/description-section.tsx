"use client";

import { FormSection } from "@/components/forms/form-section";
import { Field, Textarea } from "@/components/ui/field";
import type { Errors, ListingDraft } from "@/lib/validation";
import type { SellFormState } from "./types";

const MAX = 1000;

export function DescriptionSection({
  form,
  set,
  errors,
}: {
  form: SellFormState;
  set: (patch: Partial<SellFormState>) => void;
  errors: Errors<keyof ListingDraft>;
}) {
  return (
    <FormSection step={5} title="Description">
      <Field
        label="Describe your item"
        htmlFor="description"
        error={errors.description}
        hint="Mention age, faults, what's included and why you're selling."
      >
        <Textarea
          id="description"
          rows={6}
          maxLength={MAX}
          invalid={!!errors.description}
          aria-describedby={errors.description ? "description-error" : "description-hint"}
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="e.g. UK-used, battery health 89%, no scratches. Comes with box and charger."
        />
      </Field>
      <p className="text-right text-xs text-muted" aria-live="polite">
        {form.description.length}/{MAX}
      </p>
    </FormSection>
  );
}
