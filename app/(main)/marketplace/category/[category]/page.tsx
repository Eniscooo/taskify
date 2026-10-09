import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { CategoryRail } from "@/components/marketplace/category-rail";
import { ListingBrowser } from "@/components/marketplace/listing-browser";
import { GridSkeleton } from "@/components/ui/skeleton";
import { LISTING_CATEGORIES } from "@/lib/constants";

export function generateStaticParams() {
  return LISTING_CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/marketplace/category/[category]">): Promise<Metadata> {
  const { category } = await params;
  return { title: LISTING_CATEGORIES.find((c) => c.id === category)?.label ?? "Category" };
}

export default async function CategoryPage({ params }: PageProps<"/marketplace/category/[category]">) {
  const { category } = await params;
  const meta = LISTING_CATEGORIES.find((c) => c.id === category);
  if (!meta) notFound();

  return (
    <div className="space-y-4">
      <PageHeader title={meta.label} subtitle="Across Lagos" backHref="/marketplace" />
      <CategoryRail active={meta.id} />
      <Suspense fallback={<GridSkeleton count={8} />}>
        <ListingBrowser lockedCategory={meta.id} />
      </Suspense>
    </div>
  );
}
