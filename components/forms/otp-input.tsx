"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Six single-digit boxes with auto-advance, backspace and paste support. */
export function OtpInput({
  value,
  onChange,
  length = 6,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  invalid?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const setAt = (i: number, d: string) => {
    const next = digits.map((x, j) => (j === i ? d : x)).join("").replace(/\s+$/, "");
    onChange(next);
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          value={d.trim()}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (!v) return setAt(i, " ");
            setAt(i, v.slice(-1));
            refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d.trim()) refs.current[i - 1]?.focus();
            if (e.key === "ArrowLeft") refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight") refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!pasted) return;
            e.preventDefault();
            onChange(pasted);
            refs.current[Math.min(pasted.length, length - 1)]?.focus();
          }}
          className={cn(
            "h-14 w-full min-w-0 rounded-xl border bg-surface text-center text-2xl font-bold focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none",
            invalid ? "border-danger" : "border-border",
          )}
        />
      ))}
    </div>
  );
}
