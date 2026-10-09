import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

/** Numbered card used to break long forms into digestible steps. */
export function FormSection({
  step,
  title,
  description,
  children,
}: {
  step?: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const id = `section-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <Card className="p-4 sm:p-5">
      <section aria-labelledby={id} className="space-y-4">
        <div className="flex items-start gap-3">
          {step != null && (
            <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
              {step}
            </span>
          )}
          <div>
            <h2 id={id} className="text-base font-bold">
              {title}
            </h2>
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
        </div>
        {children}
      </section>
    </Card>
  );
}

/** Radio group rendered as large selectable cards. */
export function OptionCards<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  columns = 2,
}: {
  name: string;
  legend: string;
  options: { id: T; label: string; description?: string }[];
  value: string;
  onChange: (v: T) => void;
  error?: string;
  columns?: 2 | 3 | 4;
}) {
  const cols = { 2: "grid-cols-2", 3: "grid-cols-2 sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[columns];
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className={`grid gap-2 ${cols}`}>
        {options.map((o) => (
          <label
            key={o.id}
            className={`flex min-h-12 cursor-pointer flex-col justify-center rounded-xl border px-3 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand ${
              value === o.id ? "border-brand bg-brand-soft font-semibold text-brand-dark" : error ? "border-danger" : "border-border hover:border-foreground/30"
            }`}
          >
            <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="sr-only" />
            {o.label}
            {o.description && <span className="text-xs font-normal text-muted">{o.description}</span>}
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
