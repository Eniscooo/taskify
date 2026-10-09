"use client";

import { Info } from "lucide-react";
import { BuyerProtection } from "@/components/payments/safety-notice";
import { Chip } from "@/components/ui/chip";
import { Field, Input } from "@/components/ui/field";
import { formatNaira, formatNumber, serviceLabel } from "@/lib/formatters";
import type { ServiceCategory } from "@/lib/types";
import { digitsOnly } from "@/lib/validation";
import type { StepProps } from "./types";

const QUICK = [5_000, 10_000, 15_000, 25_000, 50_000];

export function BudgetStep({ form, set, errors, typical }: StepProps & { typical?: number }) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Your budget</h2>
      <Field label="How much do you want to pay?" htmlFor="task-budget" error={errors.budget}>
        <Input
          id="task-budget"
          inputMode="numeric"
          prefix="₦"
          invalid={!!errors.budget}
          value={form.budget ? formatNumber(Number(form.budget)) : ""}
          onChange={(e) => set({ budget: digitsOnly(e.target.value) })}
          placeholder="0"
          className="h-14 text-2xl font-extrabold"
        />
      </Field>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick budget amounts">
        {QUICK.map((q) => (
          <Chip key={q} active={Number(form.budget) === q} className="h-9 px-3 text-xs" onClick={() => set({ budget: String(q) })}>
            {formatNaira(q)}
          </Chip>
        ))}
      </div>
      {typical && (
        <p className="flex items-start gap-2 text-sm text-muted">
          <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          {serviceLabel(form.service as ServiceCategory)} jobs nearby usually start from {formatNaira(typical)}.
        </p>
      )}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="font-semibold">Providers can offer a different price. You choose.</p>
        <p className="mt-1 text-sm text-muted">
          You&apos;ll see each provider&apos;s price, rating and message, then pick the best fit.
        </p>
      </div>
      <BuyerProtection title="You only pay when you accept an offer">
        Your payment is held by Naija Market and released to the provider only after you confirm the job is done.
      </BuyerProtection>
    </div>
  );
}
