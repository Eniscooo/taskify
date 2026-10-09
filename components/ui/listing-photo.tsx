"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlaceholderImage } from "./placeholder-image";

/**
 * A listing photo, or the placeholder art when there's no photo or it fails
 * to load (seeded listings point at photos that don't exist).
 */
export function ListingPhoto({
  url,
  title,
  index = 0,
  className,
  iconClassName,
}: {
  url?: string;
  title: string;
  index?: number;
  className?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return <PlaceholderImage title={title} index={index} className={className} iconClassName={iconClassName} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- photos are already resized by the API
    <img
      src={url}
      alt={index === 0 ? title : `${title}, photo ${index + 1}`}
      loading={index === 0 ? undefined : "lazy"}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
