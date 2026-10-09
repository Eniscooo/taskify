"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DialogBaseProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Native <dialog> gives us focus trapping, Escape-to-close and top-layer
 * stacking for free. `variant="sheet"` docks to the bottom on mobile and
 * becomes a centred modal from the `sm` breakpoint up.
 */
function DialogBase({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  variant,
}: DialogBaseProps & { variant: "sheet" | "modal" | "fullscreen" }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-0 max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/45 backdrop:animate-fade-in open:flex",
        variant === "fullscreen"
          ? "h-dvh w-screen"
          : "h-dvh w-screen items-end justify-center sm:items-center sm:p-6",
      )}
    >
      <div
        className={cn(
          "flex w-full flex-col bg-surface shadow-2xl",
          variant === "sheet" &&
            "max-h-[88dvh] animate-slide-up rounded-t-3xl sm:max-w-lg sm:animate-scale-in sm:rounded-3xl",
          variant === "modal" && "m-4 max-h-[88dvh] max-w-md animate-scale-in self-center rounded-3xl",
          variant === "fullscreen" && "h-full animate-fade-in sm:mx-auto sm:max-w-2xl",
          className,
        )}
      >
        {variant === "sheet" && (
          <div aria-hidden className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-border sm:hidden" />
        )}
        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-2">
          <div>
            <h2 id={titleId} className="text-lg font-bold">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-brand"
          >
            <X aria-hidden className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-border px-5 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]">{footer}</div>}
      </div>
    </dialog>
  );
}

export function BottomSheet(props: DialogBaseProps) {
  return <DialogBase {...props} variant="sheet" />;
}

export function Modal(props: DialogBaseProps) {
  return <DialogBase {...props} variant="modal" />;
}

export function FullScreenDialog(props: DialogBaseProps) {
  return <DialogBase {...props} variant="fullscreen" />;
}
