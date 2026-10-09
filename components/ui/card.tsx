import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-surface", className)}
      {...props}
    />
  );
}

export function SectionHeader({
  title,
  action,
  subtitle,
  as: Heading = "h2",
  id,
  className,
}: {
  title: string;
  id?: string;
  subtitle?: string;
  action?: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-4", className)}>
      <div>
        <Heading id={id} className="text-lg font-bold tracking-tight">{title}</Heading>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
