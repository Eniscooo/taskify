"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormSection } from "@/components/forms/form-section";
import { PhotoUploader } from "@/components/forms/photo-uploader";
import { StickyActionBar, StickyActionSpacer } from "@/components/layout/sticky-action-bar";
import { SafetyTip } from "@/components/payments/safety-notice";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { createListing, type ListingInput } from "@/lib/api";
import { validateListing, type Errors, type ListingDraft } from "@/lib/validation";
import { DescriptionSection } from "./description-section";
import { DetailsSection } from "./details-section";
import { LocationSection } from "./location-section";
import { PriceSection } from "./price-section";
import { EMPTY_SELL_FORM, type SellFormState } from "./types";

export function SellForm() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<SellFormState>(EMPTY_SELL_FORM);
  const [errors, setErrors] = useState<Errors<keyof ListingDraft>>({});
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);
  const [publishedId, setPublishedId] = useState<string>();

  const set = (patch: Partial<SellFormState>) => {
    setForm((f) => ({ ...f, ...patch }));
    // Clear errors for fields the user is fixing.
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(patch)) delete next[k as keyof ListingDraft];
      return next;
    });
  };

  const toInput = (): ListingInput => ({
    title: form.title.trim(),
    category: (form.category || "home") as ListingInput["category"],
    condition: (form.condition || "used-good") as ListingInput["condition"],
    price: Number(form.price) || 0,
    area: form.area as ListingInput["area"],
    delivery: (form.delivery || "pickup") as ListingInput["delivery"],
    description: form.description.trim(),
    photoCount: form.photos.length,
  });

  const saveDraft = async () => {
    if (!form.title.trim()) {
      setErrors({ title: "Add a title so you can find this draft later." });
      document.getElementById("title")?.focus();
      return;
    }
    setSubmitting("draft");
    await createListing(toInput(), { draft: true });
    setSubmitting(null);
    toast("Draft saved. Finish it any time from your profile.");
  };

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateListing({ ...form, photos: form.photos.length });
    setErrors(result);
    const firstError = Object.keys(result)[0];
    if (firstError) {
      toast("Please fix the highlighted fields", "error");
      const el =
        document.getElementById(firstError === "photos" ? "section-photos" : firstError) ??
        document.getElementById(`${firstError}-error`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) el.focus({ preventScroll: true });
      return;
    }
    setSubmitting("publish");
    const listing = await createListing(toInput());
    setSubmitting(null);
    setPublishedId(listing.id);
  };

  return (
    <form noValidate onSubmit={publish} className="mx-auto max-w-2xl space-y-4">
      <FormSection step={1} title="Photos" description="Add up to 10. Clear, well-lit photos get more buyers.">
        <PhotoUploader
          photos={form.photos}
          onChange={(photos) => set({ photos })}
          invalid={!!errors.photos}
          describedBy={errors.photos ? "photos-error" : undefined}
        />
        {errors.photos && (
          <p id="photos-error" role="alert" className="text-sm font-medium text-danger">
            {errors.photos}
          </p>
        )}
      </FormSection>
      <DetailsSection form={form} set={set} errors={errors} />
      <PriceSection form={form} set={set} errors={errors} />
      <LocationSection form={form} set={set} errors={errors} />
      <DescriptionSection form={form} set={set} errors={errors} />
      <SafetyTip>
        Buyers pay through Naija Market. Never share your bank details in chat — we pay you automatically once the
        buyer confirms.
      </SafetyTip>

      <StickyActionSpacer />
      <StickyActionBar className="md:sticky md:bottom-0 md:-mx-1 md:rounded-2xl md:border md:bg-surface md:px-4">
        <Button variant="outline" size="lg" className="flex-1 md:flex-none" onClick={saveDraft} disabled={!!submitting}>
          {submitting === "draft" && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
          Save Draft
        </Button>
        <Button type="submit" size="lg" className="flex-1" disabled={!!submitting}>
          {submitting === "publish" && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
          Publish Listing
        </Button>
      </StickyActionBar>

      <Modal
        open={!!publishedId}
        onClose={() => router.push(`/marketplace/listing/${publishedId}`)}
        title="Your listing is live!"
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setPublishedId(undefined);
                setForm(EMPTY_SELL_FORM);
                window.scrollTo({ top: 0 });
              }}
            >
              Sell another
            </Button>
            <Button className="flex-1" onClick={() => router.push(`/marketplace/listing/${publishedId}`)}>
              View listing
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center py-2 text-center">
          <CheckCircle2 aria-hidden className="h-14 w-14 text-brand" />
          <p className="mt-3 text-sm text-muted">
            Buyers near {form.area} can now see “{form.title}”. We&apos;ll notify you when someone messages or buys.
          </p>
        </div>
      </Modal>
    </form>
  );
}
