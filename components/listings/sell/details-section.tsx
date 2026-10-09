"use client";

import { FormSection, OptionCards } from "@/components/forms/form-section";
import { Field, Input, Select } from "@/components/ui/field";
import { CONDITIONS, LISTING_CATEGORIES } from "@/lib/constants";
import type { Errors, ListingDraft } from "@/lib/validation";
import type { SellFormState } from "./types";

export function DetailsSection({
  form,
  set,
  errors,
}: {
  form: SellFormState;
  set: (patch: Partial<SellFormState>) => void;
  errors: Errors<keyof ListingDraft>;
}) {
  return (
    <FormSection step={2} title="Item details" description="Buyers search by title, so be specific.">
      <Field
        label="Title"
        htmlFor="title"
        error={errors.title}
        hint="Include brand, model and size, e.g. “iPhone 13, 128GB, Midnight”."
      >
        <Input
          id="title"
          value={form.title}
          maxLength={80}
          invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : "title-hint"}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="What are you selling?"
        />
      </Field>
      <Field label="Category" htmlFor="category" error={errors.category}>
        <Select
          id="category"
          value={form.category}
          invalid={!!errors.category}
          onChange={(e) => set({ category: e.target.value })}
        >
          <option value="">Choose a category</option>
          {LISTING_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </Field>
      <OptionCards
        name="condition"
        legend="Condition"
        options={CONDITIONS}
        value={form.condition}
        error={errors.condition}
        onChange={(condition) => set({ condition })}
      />
    </FormSection>
  );
}
