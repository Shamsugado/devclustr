"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder, Star } from "lucide-react";
import ItemDrawer from "@/components/items/ItemDrawer";
import { itemTypeIconMap } from "@/lib/item-type-icons";
import { formatRelativeTime } from "@/lib/format";
import type { FavoriteItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/collections";

interface FavoritesClientProps {
  items: FavoriteItem[];
  collections: FavoriteCollection[];
}

export default function FavoritesClient({ items, collections }: FavoritesClientProps) {
  const [selectedItem, setSelectedItem] = useState<FavoriteItem | null>(null);

  const isEmpty = items.length === 0 && collections.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <Star className="h-10 w-10 opacity-30" />
        <p className="font-mono text-sm">No favorites yet</p>
        <p className="font-mono text-xs opacity-60">Star items and collections to find them here</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {items.length > 0 && (
          <section>
            <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2 pb-1 border-b border-border">
              Items <span className="ml-1 opacity-50">({items.length})</span>
            </h2>
            <ul>
              {items.map((item) => {
                const IconComponent = itemTypeIconMap[item.itemType.icon] ?? Star;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="w-full flex items-center gap-3 px-2 py-1.5 rounded-sm hover:bg-accent/50 transition-colors text-left group"
                    >
                      <span style={{ color: item.itemType.color }} className="shrink-0">
                        <IconComponent className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-mono text-sm text-foreground flex-1 truncate">
                        {item.title}
                      </span>
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded border border-border text-muted-foreground shrink-0 hidden sm:inline">
                        {item.itemType.name.toLowerCase()}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground shrink-0 opacity-60 tabular-nums w-20 text-right">
                        {formatRelativeTime(item.updatedAt)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {collections.length > 0 && (
          <section>
            <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2 pb-1 border-b border-border">
              Collections <span className="ml-1 opacity-50">({collections.length})</span>
            </h2>
            <ul>
              {collections.map((col) => (
                <li key={col.id}>
                  <Link
                    href={`/collections/${col.id}`}
                    className="flex items-center gap-3 px-2 py-1.5 rounded-sm hover:bg-accent/50 transition-colors group"
                  >
                    <span className="shrink-0 text-muted-foreground">
                      <Folder className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-mono text-sm text-foreground flex-1 truncate">
                      {col.name}
                    </span>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded border border-border text-muted-foreground shrink-0 hidden sm:inline">
                      {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground shrink-0 opacity-60 tabular-nums w-20 text-right">
                      {formatRelativeTime(col.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <ItemDrawer
        itemId={selectedItem?.id ?? null}
        initialData={selectedItem ?? undefined}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
