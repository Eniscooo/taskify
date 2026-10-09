"use client";

import { UserSearch } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SERVICE_CATEGORY_ICONS } from "@/components/marketplace/category-icons";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { Provider, ServiceCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProviderCard } from "./provider-card";

export function ProviderBrowser({ providers }: { providers: Provider[] }) {
  const params = useSearchParams();
  const [service, setService] = useState<ServiceCategory | null>(
    (params.get("service") as ServiceCategory | null) ?? null,
  );
  const visible = service ? providers.filter((p) => p.service === service) : providers;
  const label = SERVICE_CATEGORIES.find((s) => s.id === service)?.label;

  const choose = (id: ServiceCategory | null) => {
    setService(id);
    window.history.replaceState(null, "", id ? `?service=${id}` : window.location.pathname);
  };

  return (
    <div className="space-y-6">
      <nav aria-label="Service categories">
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {SERVICE_CATEGORIES.map((c) => {
            const Icon = SERVICE_CATEGORY_ICONS[c.id];
            const active = service === c.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => choose(active ? null : c.id)}
                  className="group flex w-full flex-col items-center gap-1.5 rounded-xl py-1 focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <span
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors",
                      active ? "border-brand bg-brand text-white" : "border-border bg-surface text-brand group-hover:border-brand/40",
                    )}
                  >
                    <Icon aria-hidden className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <span className={cn("text-center text-xs leading-tight font-semibold", active && "text-brand")}>
                    {c.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <section aria-labelledby="providers-heading">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 id="providers-heading" className="text-lg font-bold">
              {label ? `${label} near you` : "Top providers near you"}
            </h2>
            <p className="text-sm text-muted" aria-live="polite">
              {visible.length} ID-verified {visible.length === 1 ? "provider" : "providers"}
            </p>
          </div>
          {service && (
            <button type="button" onClick={() => choose(null)} className="text-sm font-semibold text-brand hover:underline">
              Show all
            </button>
          )}
        </div>
        {visible.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {visible.map((p) => (
              <li key={p.id}>
                <ProviderCard provider={p} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={UserSearch}
            title={`No ${label?.toLowerCase()} providers nearby yet`}
            description="Post a task and we'll notify providers across Lagos."
            action={<ButtonLink href={`/hire/task/new${service ? `?service=${service}` : ""}`}>Post a Task</ButtonLink>}
          />
        )}
      </section>
    </div>
  );
}
