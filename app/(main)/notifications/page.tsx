import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { NotificationFeed } from "@/components/notifications/notification-feed";
import { ButtonLink } from "@/components/ui/button";
import { getNotifications } from "@/lib/api";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Notifications"
        backHref="/"
        actions={
          <ButtonLink href="/settings#notifications" variant="ghost" size="icon">
            <Settings aria-hidden className="h-5 w-5" />
            <span className="sr-only">Notification settings</span>
          </ButtonLink>
        }
      />
      <NotificationFeed initial={notifications} />
    </div>
  );
}
