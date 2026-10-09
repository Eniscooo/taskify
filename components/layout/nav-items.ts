import { Home, MessageCircle, PlusCircle, Receipt, Wrench, type LucideIcon } from "lucide-react";

export type BadgeKey = "messages" | "orders";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: BadgeKey;
  /** Extra path prefixes that should mark this item active. */
  match?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home, match: ["/marketplace"] },
  { href: "/hire", label: "Hire Help", icon: Wrench },
  { href: "/sell", label: "Sell", icon: PlusCircle },
  { href: "/messages", label: "Messages", icon: MessageCircle, badge: "messages" },
  { href: "/orders", label: "Orders", icon: Receipt, badge: "orders" },
];

export function isActive(pathname: string, item: NavItem) {
  if (item.href === "/") {
    return pathname === "/" || (item.match ?? []).some((m) => pathname.startsWith(m));
  }
  return pathname.startsWith(item.href);
}

/** Routes with their own sticky action bar or full-screen UI hide the bottom nav. */
const HIDE_BOTTOM_NAV = [
  /^\/messages\/.+/,
  /^\/marketplace\/listing\/.+/,
  /^\/sell/,
  /^\/hire\/task\/new/,
  /^\/hire\/provider\/.+/,
  /^\/marketplace\/search/,
  /^\/orders\/.+/,
];

export function shouldHideBottomNav(pathname: string) {
  return HIDE_BOTTOM_NAV.some((re) => re.test(pathname));
}
