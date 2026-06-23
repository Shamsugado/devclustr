"use client";

import { useState } from "react";
import ItemCard from "@/components/items/ItemCard";
import ImageCard from "@/components/items/ImageCard";
import FileRow from "@/components/items/FileRow";
import ItemDrawer from "@/components/items/ItemDrawer";
import type { ItemWithType } from "@/lib/db/items";

export default function ItemListClient({ items }: { items: ItemWithType[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const typeName = items[0]?.itemType.name.toLowerCase();
  const isImageGallery = typeName === "image";
  const isFileList = typeName === "file";

  if (isFileList) {
    return (
      <>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <FileRow key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
          ))}
        </div>
        <ItemDrawer itemId={selectedId} onClose={() => setSelectedId(null)} />
      </>
    );
  }

  const gridClass = isImageGallery
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3";

  return (
    <>
      <div className={gridClass}>
        {items.map((item) =>
          isImageGallery ? (
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
