"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function SaveButton({
  title,
  initialSaved = false,
  className,
}: {
  title: string;
  initialSaved?: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const toast = useToast();

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={(e) => {
        // Cards wrap this button in a link; keep the tap from navigating.
        e.preventDefault();
        e.stopPropagation();
        setSaved((s) => !s);
        toast(saved ? "Removed from saved items" : "Saved. Find it in your profile.");
      }}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 shadow-sm backdrop-blur transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-brand",
        className,
      )}
    >
      <Heart aria-hidden className={cn("h-5 w-5", saved ? "fill-danger text-danger" : "text-foreground")} />
      <span className="sr-only">{saved ? `Remove ${title} from saved` : `Save ${title}`}</span>
    </button>
  );
}
