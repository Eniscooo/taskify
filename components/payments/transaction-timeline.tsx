import { Check } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Vertical step tracker: done steps are filled, the first pending step is "current". */
export function TransactionTimeline({ steps, disputed }: { steps: Order["timeline"]; disputed?: boolean }) {
  const currentIdx = steps.findIndex((s) => !s.done);
  return (
    <ol aria-label="Transaction progress" className="relative">
      {steps.map((step, i) => {
        const current = i === currentIdx;
        const last = i === steps.length - 1;
        return (
          <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-8 left-[15px] h-[calc(100%-2rem)] w-0.5",
                  step.done ? "bg-brand" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                step.done && "border-brand bg-brand text-white",
                current && !disputed && "border-brand bg-surface",
                current && disputed && "border-danger bg-surface",
                !step.done && !current && "border-border bg-surface",
              )}
            >
              {step.done ? (
                <Check aria-hidden className="h-4 w-4" strokeWidth={3} />
              ) : current ? (
                <span className={cn("h-2.5 w-2.5 animate-pulse rounded-full", disputed ? "bg-danger" : "bg-brand")} />
              ) : null}
            </span>
            <div className="pt-1">
              <p className={cn("font-semibold", !step.done && !current && "text-muted")}>
                {step.label}
                <span className="sr-only">{step.done ? " — done" : current ? " — current step" : " — not yet"}</span>
              </p>
              {step.at && <p className="text-sm text-muted">{formatDateTime(step.at)}</p>}
              {current && !disputed && <p className="text-sm font-medium text-brand">Next step</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
