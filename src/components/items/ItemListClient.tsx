"use client";

import { useState } from "react";
import ItemCard from "@/components/items/ItemCard";
import ImageCard from "@/components/items/ImageCard";
import ItemDrawer from "@/components/items/ItemDrawer";
import type { ItemWithType } from "@/lib/db/items";

export default function ItemListClient({ items }: { items: ItemWithType[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isImageGallery = items[0]?.itemType.name.toLowerCase() === "image";

  const gridClass = isImageGallery
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3";

  return (
    <>
      <div className={gridClass}>
        {items.map((item) =>
          item.itemType.name.toLowerCase() === "image" ? (
            <ImageCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
          ) : (
            <ItemCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
          )
        )}
      </div>
      <ItemDrawer itemId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
