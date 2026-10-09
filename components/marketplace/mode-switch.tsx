import { ShoppingBag, Wrench } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Top-level switch between the two marketplaces. */
export function ModeSwitch({ active }: { active: "buy" | "hire" }) {
  const items = [
    { id: "buy", label: "Buy & Sell", href: "/marketplace", icon: ShoppingBag },
    { id: "hire", label: "Hire Help", href: "/hire", icon: Wrench },
  ] as const;
  return (
    <nav aria-label="Marketplace mode" className="grid grid-cols-2 gap-1 rounded-2xl bg-black/[0.05] p-1">
      {items.map(({ id, label, href, icon: Icon }) => (
        <Link
          key={id}
          href={href}
          aria-current={active === id ? "page" : undefined}
          className={cn(
            "flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-brand",
            active === id ? "bg-surface text-brand shadow-sm" : "text-muted hover:text-foreground",
          )}
        >
          <Icon aria-hidden className="h-4.5 w-4.5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
