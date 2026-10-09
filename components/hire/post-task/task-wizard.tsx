"use client";

import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { StickyActionBar, StickyActionSpacer } from "@/components/layout/sticky-action-bar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createTask } from "@/lib/api";
import { formatDate, formatNaira, serviceLabel } from "@/lib/formatters";
import type { Area, ServiceCategory } from "@/lib/types";
import { BudgetStep } from "./budget-step";
import { DetailsStep } from "./details-step";
import { JobTypeStep } from "./job-type-step";
import { EMPTY_TASK, validateStep, type TaskErrors, type TaskFormState } from "./types";
import { WhenWhereStep } from "./when-where-step";

const STEP_TITLES = ["Job type", "Details", "Where & when", "Budget"];

/** Four short steps so first-time users never face a long form. */
export function TaskWizard({ startingPrices }: { startingPrices: Partial<Record<ServiceCategory, number>> }) {
  const params = useSearchParams();
  const [form, setForm] = useState<TaskFormState>(() => ({ ...EMPTY_TASK, service: params.get("service") ?? "" }));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<TaskErrors>({});
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  const set = (patch: Partial<TaskFormState>) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(patch)) delete next[k as keyof TaskFormState];
      return next;
    });
  };

  const whenLabel = form.when === "today" ? "Today" : form.when === "this-week" ? "This week" : form.date ? formatDate(form.date, { weekday: "short", day: "numeric", month: "short" }) : "";

  const next = async () => {
    const e = validateStep(step, form);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (step < STEP_TITLES.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    setPosting(true);
    await createTask({
      title: form.title.trim(),
      service: form.service as ServiceCategory,
      area: form.area as Area,
      when: whenLabel,
      budget: Number(form.budget),
      description: form.description.trim(),
    });
    setPosting(false);
    setPosted(true);
  };

  if (posted) {
    return (
      <Card className="mx-auto max-w-lg p-6 text-center">
        <CheckCircle2 aria-hidden className="mx-auto h-16 w-16 animate-scale-in text-brand" />
        <h2 className="mt-3 text-xl font-bold">Task posted!</h2>
        <p className="mt-1 text-muted">
          We&apos;ve notified {serviceLabel(form.service as ServiceCategory).toLowerCase()} providers around {form.area}.
          Offers usually arrive within an hour.
        </p>
        <dl className="mt-5 space-y-2 rounded-2xl bg-background p-4 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Job</dt>
            <dd className="font-semibold">{form.title}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Where</dt>
            <dd className="font-semibold">{form.area}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">When</dt>
            <dd className="font-semibold">{whenLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Budget</dt>
            <dd className="font-semibold">{formatNaira(Number(form.budget))}</dd>
          </div>
        </dl>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <ButtonLink href="/hire" variant="outline">
            Back to Hire Help
          </ButtonLink>
          <ButtonLink href="/notifications">Watch for offers</ButtonLink>
        </div>
      </Card>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
      className="mx-auto max-w-2xl"
    >
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs font-semibold text-muted">
          <span>
            Step {step + 1} of {STEP_TITLES.length}
          </span>
          <span>{STEP_TITLES[step]}</span>
        </div>
        <div
          role="progressbar"
          aria-label="Task form progress"
          aria-valuemin={1}
          aria-valuemax={STEP_TITLES.length}
          aria-valuenow={step + 1}
          className="h-1.5 overflow-hidden rounded-full bg-border"
        >
          <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }} />
        </div>
      </div>

      <div key={step} className="animate-fade-in">
        {step === 0 && <JobTypeStep form={form} set={set} errors={errors} />}
        {step === 1 && <DetailsStep form={form} set={set} errors={errors} />}
        {step === 2 && <WhenWhereStep form={form} set={set} errors={errors} />}
        {step === 3 && (
          <BudgetStep form={form} set={set} errors={errors} typical={startingPrices[form.service as ServiceCategory]} />
        )}
      </div>

      <StickyActionSpacer />
      <StickyActionBar className="md:mt-8">
        {step > 0 && (
          <Button variant="outline" size="lg" onClick={() => setStep(step - 1)}>
            <ArrowLeft aria-hidden className="h-5 w-5" />
            <span className="sr-only md:not-sr-only">Back</span>
          </Button>
        )}
        <Button type="submit" size="lg" className="flex-1" disabled={posting}>
          {posting && <Loader2 aria-hidden className="h-5 w-5 animate-spin" />}
          {step === STEP_TITLES.length - 1 ? "Post Task" : "Continue"}
        </Button>
      </StickyActionBar>
    </form>
  );
}
