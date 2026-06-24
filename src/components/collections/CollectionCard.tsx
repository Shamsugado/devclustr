import Link from "next/link";
import { Star, File } from "lucide-react";
import type { CollectionMeta } from "@/lib/db/collections";
import { itemTypeIconMap } from "@/lib/item-type-icons";

export default function CollectionCard({ collection }: { collection: CollectionMeta }) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="bg-card border border-border border-l-4 rounded-lg p-4 flex flex-col gap-2 relative group hover:bg-card/80 transition-colors"
      style={{ borderLeftColor: collection.dominantTypeColor }}
    >
      {collection.isFavorite && (
        <Star className="absolute top-3 right-3 h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      )}
      <div className="pr-5">
        <p className="text-base font-semibold text-foreground truncate">{collection.name}</p>
        {collection.description && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{collection.description}</p>
        )}
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-1">
          {collection.itemTypes.map(({ typeId, icon, color }) => {
            const Icon = itemTypeIconMap[icon] ?? File;
            return (
              <span
                key={typeId}
                className="flex items-center justify-center h-5 w-5 rounded-sm"
                style={{ backgroundColor: color + "22" }}
              >
                <Icon className="h-3 w-3" style={{ color }} />
              </span>
            );
          })}
        </div>
        <span className="text-xs text-muted-foreground">{collection.itemCount} items</span>
      </div>
    </Link>
  );
}
