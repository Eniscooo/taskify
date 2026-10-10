"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormSection } from "@/components/forms/form-section";
import { PhotoUploader, photosFailed, photosUploading } from "@/components/forms/photo-uploader";
import { StickyActionBar, StickyActionSpacer } from "@/components/layout/sticky-action-bar";
import { SafetyTip } from "@/components/payments/safety-notice";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { refreshListings } from "@/lib/actions/listings";
import { ApiError, createListing, updateListing, uploadListingPhoto, type ListingInput } from "@/lib/api";
import type { MyListing } from "@/lib/types";
import { validateListing, type Errors, type ListingDraft } from "@/lib/validation";
import { DescriptionSection } from "./description-section";
import { DetailsSection } from "./details-section";
import { LocationSection } from "./location-section";
import { PriceSection } from "./price-section";
import { EMPTY_SELL_FORM, type SellFormState } from "./types";

type FormErrors = Errors<keyof ListingDraft>;

/** Form state for editing an existing listing. */
export function sellFormFrom(listing: MyListing): SellFormState {
  return {
    photos: (listing.images ?? []).map((img, i) => ({
      id: img.key,
      url: img.url,
      name: `Photo ${i + 1}`,
      key: img.key,
      status: "done",
    })),
    title: listing.title,
    category: listing.category ?? "",
    condition: listing.condition ?? "",
    price: listing.price ? String(listing.price) : "",
    negotiable: listing.negotiable ?? true,
    area: listing.area || EMPTY_SELL_FORM.area,
    delivery: listing.delivery ?? "",
    description: listing.description,
  };
}

/** Field errors from the API (e.g. LISTING_INCOMPLETE), keyed like the form. */
function apiFieldErrors(error: ApiError): FormErrors {
  const errors: FormErrors = {};
  for (const d of error.details ?? []) {
    if (d.field in EMPTY_SELL_FORM) errors[d.field as keyof ListingDraft] = d.problems[0];
  }
  return errors;
}

export function SellForm({ listing }: { listing?: MyListing }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<SellFormState>(() => (listing ? sellFormFrom(listing) : EMPTY_SELL_FORM));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);
  const [publishedId, setPublishedId] = useState<string>();
  // Once a draft is saved, later saves update it instead of creating another.
  const [listingId, setListingId] = useState(listing?.id);
  const status = listing?.status ?? "draft";
  const isLive = status === "active" || status === "sold";

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
    category: (form.category || undefined) as ListingInput["category"],
    condition: (form.condition || undefined) as ListingInput["condition"],
    price: form.price ? Number(form.price) : undefined,
    negotiable: form.negotiable,
    area: (form.area || undefined) as ListingInput["area"],
    delivery: (form.delivery || undefined) as ListingInput["delivery"],
    description: form.description.trim(),
    photos: form.photos.flatMap((p) => (p.key ? [p.key] : [])),
  });

  /** Photos must finish uploading first; returns an error to show, if any. */
  const photoProblem = () => {
    if (photosUploading(form.photos)) return "Wait for your photos to finish uploading.";
    if (photosFailed(form.photos)) return "Remove the photos that failed to upload.";
  };

  const showErrors = (found: FormErrors) => {
    setErrors(found);
    const firstError = Object.keys(found)[0];
    if (!firstError) return;
    toast("Please fix the highlighted fields", "error");
    const el =
      document.getElementById(firstError === "photos" ? "section-photos" : firstError) ??
      document.getElementById(`${firstError}-error`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) el.focus({ preventScroll: true });
  };

  const handleError = (err: unknown) => {
    if (err instanceof ApiError && err.details?.length) return showErrors(apiFieldErrors(err));
    toast(err instanceof ApiError ? err.message : "Couldn't save. Check your connection and try again.", "error");
  };

  const saveDraft = async () => {
    if (!form.title.trim()) {
      setErrors({ title: "Add a title so you can find this draft later." });
      document.getElementById("title")?.focus();
      return;
    }
    const problem = photoProblem();
    if (problem) return toast(problem, "error");
    setSubmitting("draft");
    try {
      const saved = listingId ? await updateListing(listingId, toInput()) : await createListing(toInput(), { draft: true });
      setListingId(saved.id);
      toast("Draft saved. Finish it any time from your profile.");
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(null);
    }
  };

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateListing({ ...form, photos: form.photos.length });
    if (Object.keys(found).length) return showErrors(found);
    const problem = photoProblem();
    if (problem) return toast(problem, "error");

    setSubmitting("publish");
    try {
      const saved = listingId
        ? await updateListing(listingId, { ...toInput(), ...(!isLive && { status: "active" }) })
        : await createListing(toInput());
      await refreshListings(saved.id);
      if (isLive) {
        toast("Changes saved");
        router.push(`/marketplace/listing/${saved.id}`);
        router.refresh();
      } else {
        setPublishedId(saved.id);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <form noValidate onSubmit={publish} className="mx-auto max-w-2xl space-y-4">
      <FormSection step={1} title="Photos" description="Add up to 10. Clear, well-lit photos get more buyers.">
        <PhotoUploader
          photos={form.photos}
          onChange={(photos) => set({ photos })}
          upload={uploadListingPhoto}
          // The API takes these; iPhones convert HEIC photos to JPEG for them.
          accept="image/jpeg,image/png,image/webp"
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
        {!isLive && (
          <Button variant="outline" size="lg" className="flex-1 md:flex-none" onClick={saveDraft} disabled={!!submitting}>
            {submitting === "draft" && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
            Save Draft
          </Button>
        )}
        <Button type="submit" size="lg" className="flex-1" disabled={!!submitting}>
          {submitting === "publish" && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
          {isLive ? "Save changes" : "Publish Listing"}
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
                setListingId(undefined);
                setForm(EMPTY_SELL_FORM);
                router.replace("/sell");
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
