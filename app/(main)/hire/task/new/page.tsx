import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TaskWizard } from "@/components/hire/post-task/task-wizard";
import { Skeleton } from "@/components/ui/skeleton";
import { getProviders } from "@/lib/api";
import type { ServiceCategory } from "@/lib/types";

export const metadata: Metadata = { title: "Post a task" };

export default async function NewTaskPage() {
  const providers = await getProviders();
  const startingPrices: Partial<Record<ServiceCategory, number>> = {};
  for (const p of providers) {
    startingPrices[p.service] = Math.min(startingPrices[p.service] ?? Infinity, p.startingPrice);
  }

  return (
    <>
      <PageHeader title="Post a task" subtitle="Free · Get offers from verified providers" backHref="/hire" className="md:mx-auto md:max-w-2xl" />
      <Suspense fallback={<Skeleton className="mx-auto h-80 max-w-2xl rounded-2xl" />}>
        <TaskWizard startingPrices={startingPrices} />
      </Suspense>
    </>
  );
}
