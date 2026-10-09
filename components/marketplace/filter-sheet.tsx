"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FullScreenDialog } from "@/components/ui/dialog";
import type { ListingFilters } from "@/lib/api";
import { FilterPanel } from "./filter-panel";

/**
 * Full-screen filter editor for mobile. Edits a draft copy so changes only
 * apply when the user taps "Show results".
 */
export function FilterSheet({
  open,
  onClose,
  filters,
  onApply,
  showCategory,
}: {
  open: boolean;
  onClose: () => void;
  filters: ListingFilters;
  onApply: (f: ListingFilters) => void;
  showCategory?: boolean;
}) {
  const [draft, setDraft] = useState(filters);
  const [lastOpen, setLastOpen] = useState(open);
  // Reset the draft each time the sheet opens.
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setDraft(filters);
  }

  return (
    <FullScreenDialog
      open={open}
      onClose={onClose}
      title="Filters"
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setDraft({ q: filters.q, category: showCategory ? undefined : filters.category })}
          >
            Clear all
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Show results
          </Button>
        </div>
      }
    >
      <FilterPanel filters={draft} onChange={setDraft} showCategory={showCategory} />
    </FullScreenDialog>
  );
}
