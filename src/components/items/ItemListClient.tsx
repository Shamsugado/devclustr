"use client";

import { useState } from "react";
import ItemCard from "@/components/items/ItemCard";
import ItemDrawer from "@/components/items/ItemDrawer";
import type { ItemWithType } from "@/lib/db/items";

export default function ItemListClient({ items }: { items: ItemWithType[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
        ))}
      </div>
      <ItemDrawer itemId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
