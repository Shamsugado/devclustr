"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import ItemDrawer from "@/components/items/ItemDrawer";
import { itemTypeIconMap } from "@/lib/item-type-icons";
import type { SearchItem } from "@/lib/db/items";
import type { SearchCollection } from "@/lib/db/collections";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchData = { items: SearchItem[]; collections: SearchCollection[] };

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [data, setData] = useState<SearchData | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (open && !data) {
      fetch("/api/search")
        .then((r) => r.json())
        .then((d: SearchData) => setData(d))
        .catch(() => setData({ items: [], collections: [] }));
    }
  }, [open, data]);

  function handleSelectItem(id: string) {
    onOpenChange(false);
    setSelectedItemId(id);
  }

  function handleSelectCollection(id: string) {
    onOpenChange(false);
    router.push(`/collections/${id}`);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="top-1/3 translate-y-0 overflow-hidden rounded-xl p-0" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>Search items and collections</DialogDescription>
          </DialogHeader>
          <Command>
            <CommandInput placeholder="Search items and collections..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>

              {data && data.items.length > 0 && (
                <CommandGroup heading="Items">
                  {data.items.map((item) => {
                    const Icon = itemTypeIconMap[item.type.icon] ?? itemTypeIconMap["Code"];
                    return (
                      <CommandItem
                        key={item.id}
                        value={`item-${item.id}-${item.title}`}
                        onSelect={() => handleSelectItem(item.id)}
                      >
                        <Icon className="shrink-0" style={{ color: item.type.color }} />
                        <span className="truncate">{item.title}</span>
                        {item.contentPreview && (
                          <span className="ml-2 truncate text-xs text-muted-foreground hidden sm:block">
                            {item.contentPreview}
                          </span>
                        )}
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground capitalize">
                          {item.type.name}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {data && data.items.length > 0 && data.collections.length > 0 && (
                <CommandSeparator />
              )}

              {data && data.collections.length > 0 && (
                <CommandGroup heading="Collections">
                  {data.collections.map((col) => (
                    <CommandItem
                      key={col.id}
                      value={`collection-${col.id}-${col.name}`}
                      onSelect={() => handleSelectCollection(col.id)}
                    >
                      <Folder className="shrink-0 text-muted-foreground" />
                      <span className="truncate">{col.name}</span>
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>


      <ItemDrawer
        itemId={selectedItemId}
        onClose={() => setSelectedItemId(null)}
      />
    </>
  );
}
