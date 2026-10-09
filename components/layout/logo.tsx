import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl text-base font-extrabold",
        inverted ? "bg-white text-brand" : "bg-brand text-white",
        className,
      )}
    >
      N
      <span className="-ml-px mb-2 h-1.5 w-1.5 self-end rounded-full bg-accent" />
    </span>
  );
}

export function Logo({ className, href = "/", inverted }: { className?: string; href?: string; inverted?: boolean }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-brand", className)}
    >
      <LogoMark inverted={inverted} />
      <span className={cn("text-lg font-extrabold tracking-tight", inverted && "text-white")}>
        Naija <span className={inverted ? "text-accent" : "text-brand"}>Market</span>
      </span>
    </Link>
  );
}
