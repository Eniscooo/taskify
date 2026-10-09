"use client";

import { Ban, Flag, MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

/** Overflow menu with report / block actions for a chat. */
export function ChatMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<"report" | "block" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-brand"
      >
        <MoreVertical aria-hidden className="h-5 w-5" />
        <span className="sr-only">More options</span>
      </button>
      {open && (
        <div role="menu" className="absolute top-12 right-0 z-20 w-52 animate-scale-in overflow-hidden rounded-2xl border border-border bg-surface py-1 shadow-xl">
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              setConfirm("report");
            }}
            className="flex h-11 w-full items-center gap-3 px-4 text-left text-sm font-medium hover:bg-background"
          >
            <Flag aria-hidden className="h-4 w-4" /> Report {name}
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              setConfirm("block");
            }}
            className="flex h-11 w-full items-center gap-3 px-4 text-left text-sm font-medium text-danger hover:bg-danger-soft"
          >
            <Ban aria-hidden className="h-4 w-4" /> Block {name}
          </button>
        </div>
      )}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm === "block" ? `Block ${name}?` : `Report ${name}?`}
        description={
          confirm === "block"
            ? "They won't be able to message you or see your listings. You can unblock them in Settings."
            : "Our safety team will review this conversation. They won't know you reported them."
        }
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                toast(confirm === "block" ? `${name} has been blocked` : "Report sent. Thanks for keeping Naija Market safe.", "info");
                setConfirm(null);
              }}
            >
              {confirm === "block" ? "Block" : "Report"}
            </Button>
          </div>
        }
      >
        <span />
      </Modal>
    </div>
  );
}
