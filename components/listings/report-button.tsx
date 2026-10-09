"use client";

import { Flag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const REASONS = ["Looks like a scam", "Prohibited item", "Wrong category or price", "Offensive content", "Other"];

/** "Report this listing / user" link with a reason picker. */
export function ReportButton({ subject, className }: { subject: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const toast = useToast();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-danger focus-visible:outline-2 focus-visible:outline-brand",
          className,
        )}
      >
        <Flag aria-hidden className="h-4 w-4" />
        Report {subject}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Report ${subject}`}
        description="Our trust & safety team reviews every report within 24 hours."
        footer={
          <Button
            variant="danger"
            className="w-full"
            disabled={!reason}
            onClick={() => {
              setOpen(false);
              setReason("");
              toast("Thanks. We'll review this report.", "info");
            }}
          >
            Send report
          </Button>
        }
      >
        <fieldset className="space-y-2">
          <legend className="sr-only">Reason</legend>
          {REASONS.map((r) => (
            <label key={r} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border px-3 text-sm has-[:checked]:border-danger has-[:checked]:bg-danger-soft">
              <input type="radio" name="report-reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-[var(--danger)]" />
              {r}
            </label>
          ))}
        </fieldset>
      </Modal>
    </>
  );
}
