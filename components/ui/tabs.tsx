"use client";

import { cn } from "@/lib/utils";

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  className,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn("flex rounded-xl bg-black/[0.05] p-1", className)}>
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const idx = tabs.findIndex((t) => t.id === value);
              const next = tabs[(idx + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]!;
              onChange(next.id);
              document.getElementById(`tab-${next.id}`)?.focus();
            }}
            className={cn(
              "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand",
              selected ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span className="rounded-full bg-brand px-1.5 text-[11px] leading-5 text-white">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
