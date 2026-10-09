"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { ListingPhoto } from "@/components/ui/listing-photo";
import type { ListingImage } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Swipeable gallery built on native scroll-snap (no JS gesture lib), with
 * arrow buttons and thumbnails on larger screens and keyboard support.
 */
export function ImageGallery({ title, count, images }: { title: string; count: number; images?: ListingImage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.max(0, Math.min(count - 1, i));
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  };

  return (
    <section aria-roledescription="carousel" aria-label={`Photos of ${title}`} className="space-y-3">
      <div className="relative -mx-4 overflow-hidden md:mx-0 md:rounded-3xl">
        <div
          ref={trackRef}
          tabIndex={0}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") goTo(index + 1);
            if (e.key === "ArrowLeft") goTo(index - 1);
          }}
          className="no-scrollbar flex aspect-square snap-x snap-mandatory overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand sm:aspect-[4/3]"
        >
          {Array.from({ length: count }, (_, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              className="h-full w-full shrink-0 snap-center"
            >
              <ListingPhoto url={images?.[i]?.url} title={title} index={i} className="h-full w-full" />
            </div>
          ))}
        </div>

        <p
          aria-live="polite"
          className="absolute right-3 bottom-3 rounded-full bg-foreground/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur"
        >
          Photo {index + 1} of {count}
        </p>

        {index > 0 && (
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="absolute top-1/2 left-3 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 shadow-md hover:bg-surface md:flex"
          >
            <ChevronLeft aria-hidden className="h-5 w-5" />
            <span className="sr-only">Previous photo</span>
          </button>
        )}
        {index < count - 1 && (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="absolute top-1/2 right-3 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 shadow-md hover:bg-surface md:flex"
          >
            <ChevronRight aria-hidden className="h-5 w-5" />
            <span className="sr-only">Next photo</span>
          </button>
        )}

        {/* Mobile dot indicators */}
        <div aria-hidden className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className={cn("h-1.5 rounded-full bg-white transition-all", i === index ? "w-4" : "w-1.5 opacity-60")}
            />
          ))}
        </div>
      </div>

      <div className="hidden gap-2 md:flex">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-current={i === index}
            className={cn(
              "h-16 w-16 overflow-hidden rounded-xl border-2 transition-colors focus-visible:outline-2 focus-visible:outline-brand",
              i === index ? "border-brand" : "border-transparent opacity-70 hover:opacity-100",
            )}
          >
            <ListingPhoto url={images?.[i]?.url} title={title} index={i} className="h-full w-full" iconClassName="h-1/2 w-1/2" />
            <span className="sr-only">Show photo {i + 1}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
