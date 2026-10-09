import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SERVICE_CATEGORY_ICONS } from "@/components/marketplace/category-icons";
import { formatNaira, formatRelative, serviceLabel } from "@/lib/formatters";
import type { Task } from "@/lib/types";

const STATUS: Record<Task["status"], { label: string; tone: "brand" | "info" | "neutral" | "accent" }> = {
  open: { label: "Receiving offers", tone: "accent" },
  assigned: { label: "Provider booked", tone: "info" },
  completed: { label: "Completed", tone: "brand" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export function TaskCard({ task, offerCount }: { task: Task; offerCount: number }) {
  const Icon = SERVICE_CATEGORY_ICONS[task.service];
  const status = STATUS[task.status];
  return (
    <Link
      href={`/hire/task/${task.id}`}
      className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <Icon aria-hidden className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-bold">{task.title}</h3>
        </div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden className="h-3.5 w-3.5" />
            {serviceLabel(task.service)} · {task.area}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays aria-hidden className="h-3.5 w-3.5" />
            {task.when}
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge tone={status.tone} dot>
            {status.label}
          </Badge>
          {task.status === "open" && (
            <span className="text-sm font-semibold text-brand">
              {offerCount} {offerCount === 1 ? "offer" : "offers"}
            </span>
          )}
          <span className="text-xs text-muted">
            Budget {formatNaira(task.budget)} · {formatRelative(task.postedAt)}
          </span>
        </div>
      </div>
      <ChevronRight aria-hidden className="h-5 w-5 shrink-0 text-muted" />
    </Link>
  );
}
