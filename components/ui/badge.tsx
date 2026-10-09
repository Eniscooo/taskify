import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "neutral" | "brand" | "accent" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-black/[0.06] text-muted",
  brand: "bg-brand-soft text-brand-dark",
  accent: "bg-accent-soft text-[#8a5800]",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

const dots: Record<Tone, string> = {
  neutral: "bg-muted",
  brand: "bg-brand",
  accent: "bg-accent",
  danger: "bg-danger",
  info: "bg-info",
};

export function Badge({
  tone = "neutral",
  dot,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} />}
      {children}
    </span>
  );
}
