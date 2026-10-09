import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { SellPageContent } from "@/components/listings/sell/sell-page-content";
import { ProfileSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Sell an item" };

export default function SellPage() {
  return (
    <>
      <PageHeader title="Sell an item" subtitle="Free to list · 5% fee only when it sells" backHref="/" className="md:mx-auto md:max-w-2xl" />
      {/* Reads ?edit= from the URL, which needs a Suspense boundary. */}
      <Suspense fallback={<ProfileSkeleton />}>
        <SellPageContent />
      </Suspense>
    </>
  );
}
