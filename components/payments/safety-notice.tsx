import { ShieldCheck, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Green "you're protected" callout. */
export function BuyerProtection({
  title = "Buyer protection",
  children = "Pay through Naija Market and the seller is paid only after you confirm you got the item.",
  className,
}: {
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn("flex gap-3 rounded-2xl border border-brand/20 bg-brand-soft p-4", className)}>
      <ShieldCheck aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
      <div>
        <p className="font-bold text-brand-dark">{title}</p>
        <p className="text-sm text-brand-dark/85">{children}</p>
      </div>
    </aside>
  );
}

/** Amber warning used in chats and checkout to keep money on-platform. */
export function SafetyTip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <aside
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-accent/30 bg-accent-soft px-3 py-2.5 text-sm text-[#6b4500]",
        className,
      )}
    >
      <ShieldAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </aside>
  );
}
