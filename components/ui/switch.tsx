import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Native checkbox styled as an on/off switch. */
export function Switch({ className, ...props }: Omit<ComponentProps<"input">, "type" | "role">) {
  return (
    <input
      type="checkbox"
      role="switch"
      className={cn(
        "h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-border transition-colors before:block before:h-5 before:w-5 before:translate-x-0.5 before:translate-y-0.5 before:rounded-full before:bg-white before:shadow before:transition-transform checked:bg-brand checked:before:translate-x-[22px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        className,
      )}
      {...props}
    />
  );
}
