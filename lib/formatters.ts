import { CONDITIONS, DELIVERY_METHODS, LISTING_CATEGORIES, MOCK_NOW, SERVICE_CATEGORIES } from "./constants";
import type { Condition, DeliveryMethod, ListingCategory, ServiceCategory } from "./types";

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(amount: number) {
  // Intl outputs "NGN" in some runtimes; normalise to the ₦ symbol.
  return nairaFormatter.format(amount).replace("NGN", "₦").replace(/\s/g, "");
}

export function formatCompactNaira(amount: number) {
  if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${Math.round(amount / 1_000)}k`;
  return formatNaira(amount);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}

const TZ = "Africa/Lagos";

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TZ,
  })
    .format(new Date(iso))
    .toUpperCase();
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-NG", { ...opts, timeZone: TZ }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso, { day: "numeric", month: "short" })}, ${formatTime(iso)}`;
}

function dayKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
}

function daysBetween(iso: string, now = MOCK_NOW) {
  const a = new Date(dayKey(iso)).getTime();
  const b = new Date(dayKey(now)).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** "10:42 AM" today, "Yesterday", weekday this week, otherwise a date. */
export function formatConversationTime(iso: string) {
  const diff = daysBetween(iso);
  if (diff <= 0) return formatTime(iso);
  if (diff === 1) return "Yesterday";
  if (diff < 7) return formatDate(iso, { weekday: "short" });
  return formatDate(iso, { day: "numeric", month: "short" });
}

export function formatRelative(iso: string) {
  const minutes = Math.round((new Date(MOCK_NOW).getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso, { day: "numeric", month: "short" });
}

export type DayGroup = "Today" | "Yesterday" | "Earlier";

export function dayGroup(iso: string): DayGroup {
  const diff = daysBetween(iso);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return "Earlier";
}

export function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}

export const conditionLabel = (c: Condition) => CONDITIONS.find((x) => x.id === c)?.label ?? c;
export const deliveryLabel = (d: DeliveryMethod) => DELIVERY_METHODS.find((x) => x.id === d)?.label ?? d;
export const categoryLabel = (c: ListingCategory) => LISTING_CATEGORIES.find((x) => x.id === c)?.label ?? c;
export const serviceLabel = (s: ServiceCategory) => SERVICE_CATEGORIES.find((x) => x.id === s)?.label ?? s;

export function shortName(name: string) {
  const [first, last] = name.split(" ");
  return last ? `${first} ${last[0]}.` : first!;
}
