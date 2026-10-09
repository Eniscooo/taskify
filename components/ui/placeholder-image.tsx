import {
  Armchair,
  Bike,
  Camera,
  Car,
  Fan,
  Footprints,
  Gamepad2,
  Laptop,
  Package,
  Refrigerator,
  Shirt,
  Smartphone,
  Sofa,
  Speaker,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { cn, pickBySeed } from "@/lib/utils";

const KEYWORD_ICONS: [RegExp, LucideIcon][] = [
  [/iphone|samsung|galaxy|phone/i, Smartphone],
  [/macbook|elitebook|laptop/i, Laptop],
  [/\btv\b/i, Tv],
  [/playstation|ps5/i, Gamepad2],
  [/sofa/i, Sofa],
  [/chair|dining|table/i, Armchair],
  [/fan/i, Fan],
  [/freezer|fridge/i, Refrigerator],
  [/nike|shoe|sneaker/i, Footprints],
  [/ankara|gown|dress|shirt/i, Shirt],
  [/corolla|toyota|car/i, Car],
  [/motorcycle|bike/i, Bike],
  [/camera|canon/i, Camera],
  [/speaker|jbl/i, Speaker],
];

const GRADIENTS = [
  "from-[#e6f4ec] to-[#c9e8d6]",
  "from-[#fff4dd] to-[#ffe2ad]",
  "from-[#e8efff] to-[#cddbff]",
  "from-[#f3ecff] to-[#ddd0fb]",
  "from-[#fde9ee] to-[#f8cfd9]",
  "from-[#e3f5f6] to-[#c3e7ea]",
] as const;

const ICON_TONES = [
  "text-[#0a7c4a]",
  "text-[#b57400]",
  "text-[#2563eb]",
  "text-[#6d4ed6]",
  "text-[#c0395f]",
  "text-[#0e7c88]",
] as const;

/**
 * Stand-in for listing photos until media is served from Cloudflare R2.
 * Picks a stable icon and tint from the listing title so cards stay distinct.
 */
export function PlaceholderImage({
  title,
  index = 0,
  className,
  iconClassName,
}: {
  title: string;
  index?: number;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = KEYWORD_ICONS.find(([re]) => re.test(title))?.[1] ?? Package;
  const seed = `${title}-${index}`;
  const gradientIdx = GRADIENTS.indexOf(pickBySeed(seed, GRADIENTS));
  return (
    <div
      role="img"
      aria-label={index > 0 ? `${title}, photo ${index + 1}` : `Photo of ${title}`}
      className={cn(
        "flex items-center justify-center bg-gradient-to-br",
        GRADIENTS[gradientIdx],
        className,
      )}
    >
      <Icon
        aria-hidden
        strokeWidth={1.4}
        className={cn("h-1/3 w-1/3 max-h-24 max-w-24", ICON_TONES[gradientIdx], iconClassName)}
        style={{ transform: `rotate(${(index % 3) * 6 - 6}deg)` }}
      />
    </div>
  );
}
