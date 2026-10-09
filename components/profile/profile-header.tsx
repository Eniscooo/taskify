import { MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { RatingStars } from "@/components/ui/rating-stars";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { formatDate } from "@/lib/formatters";
import type { User } from "@/lib/types";

export function ProfileHeader({ user, actions }: { user: User; actions?: ReactNode }) {
  return (
    <header className="flex flex-col items-center text-center md:flex-row md:items-center md:gap-6 md:text-left">
      <Avatar name={user.name} size="xl" />
      <div className="mt-3 min-w-0 flex-1 md:mt-0">
        <h1 className="text-2xl font-extrabold tracking-tight">{user.name}</h1>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 md:justify-start">
          <VerificationBadge verified={user.verified} />
          <span className="inline-flex items-center gap-1 text-sm">
            <RatingStars value={user.rating} />
            <span className="font-semibold">{user.rating.toFixed(1)}</span>
            <span className="text-muted">({user.reviewCount})</span>
          </span>
        </div>
        <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted md:justify-start">
          <MapPin aria-hidden className="h-4 w-4" />
          {user.area}, Lagos · Joined {formatDate(user.joinedAt, { month: "short", year: "numeric" })}
        </p>
        {user.bio && <p className="mt-2 max-w-xl text-sm text-foreground/85">{user.bio}</p>}
      </div>
      {actions && <div className="mt-4 flex w-full gap-2 md:mt-0 md:w-auto">{actions}</div>}
    </header>
  );
}

export function ProfileStats({ user }: { user: User }) {
  const stats = [
    { label: "Listings", value: user.listingsCount },
    { label: "Sales", value: user.salesCount },
    { label: "Jobs", value: user.jobsCount },
    { label: "Reviews", value: user.reviewCount },
  ];
  return (
    <dl className="grid grid-cols-4 divide-x divide-border rounded-2xl border border-border bg-surface py-4 text-center">
      {stats.map((s) => (
        <div key={s.label}>
          <dt className="text-xs text-muted">{s.label}</dt>
          <dd className="text-xl font-extrabold">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
