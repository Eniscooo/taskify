import { CalendarDays, MapPin, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { OffersList } from "@/components/hire/offers-list";
import { SERVICE_CATEGORY_ICONS } from "@/components/marketplace/category-icons";
import { BuyerProtection } from "@/components/payments/safety-notice";
import { Badge } from "@/components/ui/badge";
import { Card, SectionHeader } from "@/components/ui/card";
import { getConversationIdForUser, getProvider, getTask, getTaskOffers, staticIds } from "@/lib/api";
import { formatNaira, formatRelative, serviceLabel } from "@/lib/formatters";
import type { Provider } from "@/lib/types";

export function generateStaticParams() {
  return staticIds.tasks();
}

export async function generateMetadata({ params }: PageProps<"/hire/task/[id]">): Promise<Metadata> {
  const task = await getTask((await params).id);
  return { title: task?.title ?? "Task" };
}

export default async function TaskPage({ params }: PageProps<"/hire/task/[id]">) {
  const { id } = await params;
  const task = await getTask(id);
  if (!task) notFound();

  const offers = await getTaskOffers(id);
  const providerList = await Promise.all(offers.map((o) => getProvider(o.providerId)));
  const providers = Object.fromEntries(
    providerList.filter((p): p is Provider => !!p).map((p) => [p.id, p]),
  );
  const conversationHrefs = Object.fromEntries(
    await Promise.all(
      Object.values(providers).map(async (p) => {
        const cid = await getConversationIdForUser(p.userId);
        return [p.id, cid ? `/messages/${cid}` : "/messages"] as const;
      }),
    ),
  );
  const Icon = SERVICE_CATEGORY_ICONS[task.service];

  return (
    <>
      <PageHeader title="Your task" backHref="/hire" />
      <div className="space-y-6">
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Icon aria-hidden className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold">{task.title}</h2>
              <p className="text-sm text-muted">Posted {formatRelative(task.postedAt)}</p>
            </div>
            <Badge tone={task.status === "open" ? "accent" : "brand"} dot>
              {task.status === "open" ? "Open" : task.status === "completed" ? "Completed" : "Booked"}
            </Badge>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <MapPin aria-hidden className="h-4 w-4 text-muted" />
              <dt className="sr-only">Service and area</dt>
              <dd>
                {serviceLabel(task.service)} · {task.area}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays aria-hidden className="h-4 w-4 text-muted" />
              <dt className="sr-only">When</dt>
              <dd>{task.when}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Wallet aria-hidden className="h-4 w-4 text-muted" />
              <dt>Budget:</dt>
              <dd className="font-bold">{formatNaira(task.budget)}</dd>
            </div>
          </dl>
          <p className="mt-4 rounded-xl bg-background p-3 text-sm leading-relaxed">{task.description}</p>
        </Card>

        <BuyerProtection title="Pay safely when you accept">
          Your payment is held by Naija Market until you confirm the job is completed. If the provider doesn&apos;t
          show up or the work isn&apos;t done, you get a refund.
        </BuyerProtection>

        <section aria-labelledby="offers-title">
          <SectionHeader
            id="offers-title"
            title={`${offers.length} ${offers.length === 1 ? "offer" : "offers"}`}
            subtitle="Providers can offer a different price. You choose."
          />
          <OffersList
            offers={offers}
            providers={providers}
            budget={task.budget}
            taskTitle={task.title}
            closed={task.status !== "open"}
            conversationHrefs={conversationHrefs}
          />
        </section>
      </div>
    </>
  );
}
