import {
  Bookmark,
  ChevronRight,
  ClipboardList,
  HelpCircle,
  Package,
  Receipt,
  Settings,
  Star,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

const ITEMS: { href: string; label: string; icon: LucideIcon; hint?: string }[] = [
  { href: "#listings", label: "My Listings", icon: Package },
  { href: "/orders", label: "My Orders", icon: Receipt },
  { href: "/hire", label: "My Tasks", icon: ClipboardList },
  { href: "#saved", label: "Saved Items", icon: Bookmark },
  { href: "#reviews", label: "Reviews", icon: Star },
  { href: "#wallet", label: "Wallet", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings#help", label: "Help", icon: HelpCircle, hint: "Disputes, safety, payments" },
];

export function ProfileMenu() {
  return (
    <nav aria-label="Profile sections">
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface md:grid md:grid-cols-2 md:divide-y-0">
        {ITEMS.map(({ href, label, icon: Icon, hint }) => (
          <li key={label} className="md:border-b md:border-border md:odd:border-r">
            <Link
              href={href}
              className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{label}</span>
                {hint && <span className="block text-xs text-muted">{hint}</span>}
              </span>
              <ChevronRight aria-hidden className="h-5 w-5 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
