import {
  AlertTriangle,
  Banknote,
  CreditCard,
  HandCoins,
  MessageCircle,
  PackageCheck,
  Star,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { formatRelative } from "@/lib/formatters";
import type { AppNotification, NotificationKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const KIND: Record<NotificationKind, { icon: LucideIcon; tone: string }> = {
  payment: { icon: CreditCard, tone: "bg-info-soft text-info" },
  handover: { icon: PackageCheck, tone: "bg-brand-soft text-brand" },
  offer: { icon: HandCoins, tone: "bg-accent-soft text-[#8a5800]" },
  payout: { icon: Banknote, tone: "bg-brand-soft text-brand" },
  message: { icon: MessageCircle, tone: "bg-info-soft text-info" },
  dispute: { icon: AlertTriangle, tone: "bg-danger-soft text-danger" },
  review: { icon: Star, tone: "bg-accent-soft text-[#8a5800]" },
};

export function NotificationItem({ notification, onOpen }: { notification: AppNotification; onOpen?: () => void }) {
  const { icon: Icon, tone } = KIND[notification.kind];
  return (
    <Link
      href={notification.href}
      onClick={onOpen}
      className={cn(
        "flex gap-3 px-4 py-3.5 transition-colors hover:bg-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
        !notification.read && "bg-brand-soft/40",
      )}
    >
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", tone)}>
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm", !notification.read ? "font-bold" : "font-semibold")}>{notification.title}</p>
        <p className="text-sm text-foreground/80">{notification.body}</p>
        <time dateTime={notification.createdAt} className="text-xs text-muted">
          {formatRelative(notification.createdAt)}
        </time>
      </div>
      {!notification.read && (
        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-brand">
          <span className="sr-only">Unread</span>
        </span>
      )}
    </Link>
  );
}
