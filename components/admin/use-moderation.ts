"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

/**
 * Local row state for moderation actions. Each `update` would call the
 * matching admin endpoint (PATCH /admin/<entity>/:id) and is optimistic here.
 */
export function useModeration<T extends { id: string }>(initial: T[]) {
  const [rows, setRows] = useState(initial);
  const toast = useToast();
  const update = (id: string, patch: Partial<T>, message: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    toast(message);
  };
  return { rows, update };
}
