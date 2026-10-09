"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { PhotoUploader, type UploadedPhoto } from "@/components/forms/photo-uploader";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/field";
import { openDispute } from "@/lib/api";
import { cn } from "@/lib/utils";

const REASONS = {
  item: ["Item not received", "Item not as described", "Seller did not show", "Other"],
  service: ["Provider did not show", "Service not completed", "Poor quality work", "Other"],
};

export function DisputeSheet({
  open,
  onClose,
  orderId,
  kind,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  orderId: string;
  kind: "item" | "service";
  onSubmitted: () => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [errors, setErrors] = useState<{ reason?: string; details?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const next: typeof errors = {};
    if (!reason) next.reason = "Choose what went wrong.";
    if (details.trim().length < 20) next.details = "Tell us a bit more (at least 20 characters).";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    await openDispute({ orderId, reason, details, evidenceCount: photos.length });
    setSubmitting(false);
    onSubmitted();
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Report a problem"
      description="The money stays held while we look into it."
      footer={
        <Button variant="danger" size="lg" className="w-full" onClick={submit} disabled={submitting}>
          {submitting && <Loader2 aria-hidden className="h-5 w-5 animate-spin" />}
          Submit dispute
        </Button>
      }
    >
      <div className="space-y-5">
        <fieldset aria-describedby={errors.reason ? "reason-error" : undefined}>
          <legend className="mb-2 text-sm font-semibold">What went wrong?</legend>
          <div className="space-y-2">
            {REASONS[kind].map((r) => (
              <label
                key={r}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand",
                  reason === r ? "border-danger bg-danger-soft" : "border-border",
                )}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="h-4 w-4 accent-[var(--danger)]"
                />
                {r}
              </label>
            ))}
          </div>
          {errors.reason && (
            <p id="reason-error" role="alert" className="mt-1.5 text-sm font-medium text-danger">
              {errors.reason}
            </p>
          )}
        </fieldset>
        <Field label="Describe the problem" htmlFor="dispute-details" error={errors.details}>
          <Textarea
            id="dispute-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            invalid={!!errors.details}
            placeholder="e.g. The phone screen has a crack that wasn't shown in the photos."
          />
        </Field>
        <div>
          <p className="mb-2 text-sm font-semibold">
            Photo evidence <span className="font-normal text-muted">(optional)</span>
          </p>
          <PhotoUploader photos={photos} onChange={setPhotos} max={5} showCover={false} label="Add evidence" />
        </div>
      </div>
    </BottomSheet>
  );
}
