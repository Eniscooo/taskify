"use client";

import { useId, useState } from "react";
import { Switch } from "@/components/ui/switch";

export function ToggleRow({ label, description, defaultChecked }: { label: string; description?: string; defaultChecked?: boolean }) {
  const id = useId();
  const [checked, setChecked] = useState(!!defaultChecked);
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-3">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block font-medium">{label}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </label>
      <Switch id={id} checked={checked} onChange={(e) => setChecked(e.target.checked)} />
    </div>
  );
}
