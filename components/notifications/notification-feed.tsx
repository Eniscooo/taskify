"use client";

import { BellOff, CheckCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { dayGroup, type DayGroup } from "@/lib/formatters";
import type { AppNotification } from "@/lib/types";
import { NotificationItem } from "./notification-item";

const GROUPS: DayGroup[] = ["Today", "Yesterday", "Earlier"];

export function NotificationFeed({ initial }: { initial: AppNotification[] }) {
  const [items, setItems] = useState(initial);
  const unread = items.filter((n) => !n.read).length;

  if (!items.length) {
    return (
      <EmptyState
        icon={BellOff}
        title="You're all caught up"
        description="Payment updates, offers and messages will show up here."
      />
    );
  }

  const markRead = (id?: string) =>
    setItems((list) => list.map((n) => (id === undefined || n.id === id ? { ...n, read: true } : n)));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted" aria-live="polite">
          {unread ? `${unread} unread` : "All read"}
        </p>
        <Button variant="ghost" size="sm" onClick={() => markRead()} disabled={!unread}>
          <CheckCheck aria-hidden className="h-4 w-4" />
          Mark all as read
        </Button>
      </div>
      {GROUPS.map((group) => {
        const list = items.filter((n) => dayGroup(n.createdAt) === group);
        if (!list.length) return null;
        return (
          <section key={group} aria-labelledby={`group-${group}`}>
            <h2 id={`group-${group}`} className="mb-2 text-sm font-bold tracking-wide text-muted uppercase">
              {group}
            </h2>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {list.map((n) => (
                <li key={n.id}>
                  <NotificationItem notification={n} onOpen={() => markRead(n.id)} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
