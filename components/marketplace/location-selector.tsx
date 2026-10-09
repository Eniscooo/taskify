"use client";

import { Check, ChevronDown, LocateFixed, MapPin } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/dialog";
import { AREAS } from "@/lib/constants";
import type { Area } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LocationSelector({
  value,
  onChange,
  className,
}: {
  value: Area;
  onChange?: (area: Area) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [area, setArea] = useState<Area>(value);

  const select = (a: Area) => {
    setArea(a);
    onChange?.(a);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-full text-sm font-semibold focus-visible:outline-2 focus-visible:outline-brand",
          className,
        )}
      >
        <MapPin aria-hidden className="h-4 w-4 text-brand" />
        <span>{area}, Lagos</span>
        <ChevronDown aria-hidden className="h-4 w-4 text-muted" />
        <span className="sr-only">. Change location</span>
      </button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Choose your area"
        description="We'll show listings and providers closest to you."
      >
        <button
          type="button"
          onClick={() => select("Yaba")}
          className="mb-2 flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold text-brand hover:bg-brand-soft"
        >
          <LocateFixed aria-hidden className="h-5 w-5" />
          Use my current location
        </button>
        <ul className="divide-y divide-border">
          {AREAS.map((a) => (
            <li key={a}>
              <button
                type="button"
                onClick={() => select(a)}
                aria-pressed={a === area}
                className="flex h-12 w-full items-center justify-between rounded-lg px-3 text-left hover:bg-background"
              >
                {a}, Lagos
                {a === area && <Check aria-hidden className="h-5 w-5 text-brand" />}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </>
  );
}
