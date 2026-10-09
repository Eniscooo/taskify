"use client";

import { OptionCards } from "@/components/forms/form-section";
import { Field, Input, Select } from "@/components/ui/field";
import { AREAS, MOCK_NOW } from "@/lib/constants";
import type { StepProps, TaskFormState } from "./types";

const WHEN_OPTIONS: { id: Exclude<TaskFormState["when"], "">; label: string; description: string }[] = [
  { id: "today", label: "Today", description: "As soon as possible" },
  { id: "this-week", label: "This week", description: "Flexible on the day" },
  { id: "date", label: "Pick a date", description: "Choose a specific day" },
];

export function WhenWhereStep({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Where and when?</h2>
      <Field label="Area" htmlFor="task-area" error={errors.area}>
        <Select id="task-area" value={form.area} invalid={!!errors.area} onChange={(e) => set({ area: e.target.value })}>
          <option value="">Choose your area</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}, Lagos
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="Street or landmark"
        htmlFor="task-landmark"
        optional
        hint="Only shared with the provider you hire."
      >
        <Input
          id="task-landmark"
          value={form.landmark}
          onChange={(e) => set({ landmark: e.target.value })}
          placeholder="e.g. Off Herbert Macaulay Way, near Yaba bus stop"
        />
      </Field>
      <OptionCards
        name="when"
        legend="When?"
        columns={3}
        options={WHEN_OPTIONS}
        value={form.when}
        error={errors.when}
        onChange={(when) => set({ when })}
      />
      {form.when === "date" && (
        <Field label="Date" htmlFor="task-date" error={errors.date}>
          <Input
            id="task-date"
            type="date"
            min={MOCK_NOW.slice(0, 10)}
            value={form.date}
            invalid={!!errors.date}
            onChange={(e) => set({ date: e.target.value })}
          />
        </Field>
      )}
    </div>
  );
}
