"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/** Round back button that floats over hero imagery on mobile. */
export function FloatingBackButton({ fallbackHref, className }: { fallbackHref: string; className?: string }) {
  const router = useRouter();
  return (
    <Link
      href={fallbackHref}
      onClick={(e) => {
        if (window.history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full bg-surface/90 shadow-md backdrop-blur focus-visible:outline-2 focus-visible:outline-brand",
        className,
      )}
    >
      <ArrowLeft aria-hidden className="h-5 w-5" />
      <span className="sr-only">Back</span>
    </Link>
  );
}
