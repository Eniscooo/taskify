import { BadgeCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerificationBadge({
  verified,
  label = "ID verified",
  compact,
  className,
}: {
  verified: boolean;
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  if (!verified) {
    if (compact) return null;
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs font-medium text-muted", className)}>
        <ShieldAlert aria-hidden className="h-3.5 w-3.5" />
        Not yet verified
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold text-brand", className)}>
      <BadgeCheck aria-hidden className="h-4 w-4" />
      {compact ? <span className="sr-only">{label}</span> : label}
    </span>
  );
}
