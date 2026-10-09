import { ClipboardList, Plus, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ProviderBrowser } from "@/components/hire/provider-browser";
import { TaskCard } from "@/components/hire/task-card";
import { ModeSwitch } from "@/components/marketplace/mode-switch";
import { SearchBar } from "@/components/marketplace/search-bar";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/card";
import { ProviderCardSkeleton } from "@/components/ui/skeleton";
import { getProviders, getTaskOffers, getTasks } from "@/lib/api";

export const metadata: Metadata = { title: "Hire Help" };

const STEPS = [
  { icon: ClipboardList, title: "Post a task", body: "Say what you need and your budget." },
  { icon: Plus, title: "Get offers", body: "Verified providers nearby send prices." },
  { icon: ShieldCheck, title: "Pay safely", body: "We hold the money until the job is done." },
];

export default async function HirePage() {
  const [providers, tasks] = await Promise.all([getProviders(), getTasks()]);
  const openTasks = tasks.filter((t) => t.status === "open");
  const offerCounts = await Promise.all(openTasks.map((t) => getTaskOffers(t.id).then((o) => o.length)));

  return (
    <div className="space-y-6 pt-3 md:pt-0">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Hire Help</h1>
          <p className="text-muted">Find trusted people nearby</p>
        </div>
        <ButtonLink href="/hire/task/new" className="hidden md:inline-flex">
          <Plus aria-hidden className="h-4 w-4" />
          Post a Task
        </ButtonLink>
      </header>

      <SearchBar placeholder="Search plumbers, cleaners, movers..." />
      <ModeSwitch active="hire" />

      <section className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-5 text-white">
        <h2 className="text-lg font-bold">Need something done?</h2>
        <p className="text-sm text-white/85">Describe the job. Providers send offers — you choose.</p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="flex items-start gap-3 rounded-2xl bg-white/10 p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                {i + 1}
              </span>
              <div>
                <p className="flex items-center gap-1.5 font-semibold">
                  <Icon aria-hidden className="h-4 w-4" />
                  {title}
                </p>
                <p className="text-sm text-white/80">{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <ButtonLink href="/hire/task/new" variant="accent" size="lg" className="mt-4 w-full sm:w-auto">
          <Plus aria-hidden className="h-5 w-5" />
          Post a Task
        </ButtonLink>
      </section>

      {openTasks.length > 0 && (
        <section aria-labelledby="my-tasks">
          <SectionHeader id="my-tasks" title="Your open tasks" />
          <ul className="grid gap-3 md:grid-cols-2">
            {openTasks.map((t, i) => (
              <li key={t.id}>
                <TaskCard task={t} offerCount={offerCounts[i]!} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Suspense
        fallback={
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ProviderBrowser providers={providers} />
      </Suspense>
    </div>
  );
}
