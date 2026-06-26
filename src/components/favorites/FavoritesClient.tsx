"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder, Star } from "lucide-react";
import ItemDrawer from "@/components/items/ItemDrawer";
import { itemTypeIconMap } from "@/lib/item-type-icons";
import { formatRelativeTime } from "@/lib/format";
import type { FavoriteItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/collections";

type ItemSort = "date" | "name" | "type";
type CollectionSort = "date" | "name";
type Dir = "asc" | "desc";

const ITEM_SORT_DEFAULTS: Record<ItemSort, Dir> = { date: "desc", name: "asc", type: "asc" };
const COLLECTION_SORT_DEFAULTS: Record<CollectionSort, Dir> = { date: "desc", name: "asc" };

function sortItems(items: FavoriteItem[], sort: ItemSort, dir: Dir): FavoriteItem[] {
  return [...items].sort((a, b) => {
    let cmp = 0;
    if (sort === "name") cmp = a.title.localeCompare(b.title);
    else if (sort === "type") cmp = a.itemType.name.localeCompare(b.itemType.name) || a.title.localeCompare(b.title);
    else cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return dir === "asc" ? cmp : -cmp;
  });
}

function sortCollections(cols: FavoriteCollection[], sort: CollectionSort, dir: Dir): FavoriteCollection[] {
  return [...cols].sort((a, b) => {
    let cmp = 0;
    if (sort === "name") cmp = a.name.localeCompare(b.name);
    else cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return dir === "asc" ? cmp : -cmp;
  });
}

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir?: Dir;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-xs px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 ${
        active ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {active && dir && (
        <span className="opacity-60">{dir === "asc" ? "↑" : "↓"}</span>
      )}
    </button>
  );
}

interface FavoritesClientProps {
  items: FavoriteItem[];
  collections: FavoriteCollection[];
}

export default function FavoritesClient({ items, collections }: FavoritesClientProps) {
  const [selectedItem, setSelectedItem] = useState<FavoriteItem | null>(null);

  const [itemSort, setItemSort] = useState<ItemSort>("date");
  const [itemDir, setItemDir] = useState<Dir>(ITEM_SORT_DEFAULTS.date);

  const [collectionSort, setCollectionSort] = useState<CollectionSort>("date");
  const [collectionDir, setCollectionDir] = useState<Dir>(COLLECTION_SORT_DEFAULTS.date);

  function handleItemSort(next: ItemSort) {
    if (next === itemSort) {
      setItemDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setItemSort(next);
      setItemDir(ITEM_SORT_DEFAULTS[next]);
    }
  }

  function handleCollectionSort(next: CollectionSort) {
    if (next === collectionSort) {
      setCollectionDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setCollectionSort(next);
      setCollectionDir(COLLECTION_SORT_DEFAULTS[next]);
    }
  }

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

  const sortedItems = sortItems(items, itemSort, itemDir);
  const sortedCollections = sortCollections(collections, collectionSort, collectionDir);

  return (
    <>
      <div className="space-y-8">
        {items.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-border">
              <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                Items <span className="ml-1 opacity-50">({items.length})</span>
              </h2>
              <div className="flex items-center gap-0.5">
                {(["date", "name", "type"] as const).map((opt) => (
                  <SortButton
                    key={opt}
                    label={opt}
                    active={itemSort === opt}
                    dir={itemSort === opt ? itemDir : undefined}
                    onClick={() => handleItemSort(opt)}
                  />
                ))}
              </div>
            </div>
            <ul>
              {sortedItems.map((item) => {
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
                      <span
                        className="font-mono text-xs px-1.5 py-0.5 rounded border shrink-0 hidden sm:inline"
                        style={{
                          borderColor: item.itemType.color + "66",
                          color: item.itemType.color,
                          backgroundColor: item.itemType.color + "11",
                        }}
                      >
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
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-border">
              <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                Collections <span className="ml-1 opacity-50">({collections.length})</span>
              </h2>
              <div className="flex items-center gap-0.5">
                {(["date", "name"] as const).map((opt) => (
                  <SortButton
                    key={opt}
                    label={opt}
                    active={collectionSort === opt}
                    dir={collectionSort === opt ? collectionDir : undefined}
                    onClick={() => handleCollectionSort(opt)}
                  />
                ))}
              </div>
            </div>
            <ul>
              {sortedCollections.map((col) => (
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
