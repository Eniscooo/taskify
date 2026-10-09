"use client";

import { PhotoUploader } from "@/components/forms/photo-uploader";
import { Field, Input, Textarea } from "@/components/ui/field";
import type { StepProps } from "./types";

export function DetailsStep({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Describe the job</h2>
      <Field label="Job title" htmlFor="task-title" error={errors.title}>
        <Input
          id="task-title"
          value={form.title}
          maxLength={60}
          invalid={!!errors.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="e.g. Kitchen sink leak"
        />
      </Field>
      <Field
        label="Details"
        htmlFor="task-description"
        error={errors.description}
        hint="What's wrong, how big is the job, anything the provider should bring?"
      >
        <Textarea
          id="task-description"
          rows={5}
          value={form.description}
          invalid={!!errors.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="e.g. Water is dripping from under the kitchen sink. The cabinet floor is getting soaked."
        />
      </Field>
      <div>
        <p className="mb-2 text-sm font-semibold">
          Photos <span className="font-normal text-muted">(optional, helps providers quote accurately)</span>
        </p>
        <PhotoUploader photos={form.photos} onChange={(photos) => set({ photos })} max={5} showCover={false} />
      </div>
    </div>
  );
}
