import { cn, initials, pickBySeed } from "@/lib/utils";

const palettes = [
  "bg-[#d9efe3] text-[#075c37]",
  "bg-[#ffe9c7] text-[#8a5800]",
  "bg-[#dbe7ff] text-[#1d4ed8]",
  "bg-[#f9dde4] text-[#a3244a]",
  "bg-[#e8e1fb] text-[#5b3cc4]",
  "bg-[#d7f0f2] text-[#0e6b75]",
] as const;

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export function Avatar({
  name,
  size = "md",
  online,
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  online?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        role="img"
        aria-label={`${name}'s profile photo`}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-bold",
          sizes[size],
          pickBySeed(name, palettes),
        )}
      >
        {initials(name)}
      </span>
      {online && (
        <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-surface bg-brand">
          <span className="sr-only">Online</span>
        </span>
      )}
    </span>
  );
}
