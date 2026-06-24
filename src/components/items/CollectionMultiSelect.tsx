"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, FolderOpen } from "lucide-react";

export interface CollectionOption {
  id: string;
  name: string;
}

interface CollectionMultiSelectProps {
  collections: CollectionOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
}

export default function CollectionMultiSelect({
  collections,
  selected,
  onChange,
  loading,
}: CollectionMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  const label =
    selected.length === 0
      ? "None"
      : selected.length === 1
        ? (collections.find((c) => c.id === selected[0])?.name ?? "1 collection")
        : `${selected.length} collections`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none hover:border-primary/50 focus:border-primary transition-colors"
      >
        <span className={selected.length === 0 ? "text-muted-foreground" : ""}>{loading ? "Loading…" : label}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {collections.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">No collections yet</p>
          ) : (
            collections.map((col) => {
              const isChecked = selected.includes(col.id);
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => toggle(col.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                >
                  <span
                    className={`flex items-center justify-center h-4 w-4 rounded border shrink-0 transition-colors ${
                      isChecked ? "bg-primary border-primary" : "border-border"
                    }`}
                  >
                    {isChecked && <Check className="h-3 w-3 text-primary-foreground" />}
                  </span>
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{col.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
