"use client";

import { useState } from "react";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link2,
  File,
  Image as ImageIcon,
  Star,
  Pin,
  Layers,
  FolderOpen,
  Clock,
} from "lucide-react";
import ItemDrawer from "@/components/items/ItemDrawer";
import type { CollectionMeta } from "@/lib/db/collections";
import type { getPinnedItems, getRecentItems } from "@/lib/db/items";

type DashboardItem = Awaited<ReturnType<typeof getPinnedItems>>[0];
type DashboardStats = {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
};

interface DashboardMainProps {
  stats: DashboardStats;
  recentCollections: CollectionMeta[];
  pinnedItems: DashboardItem[];
  recentItems: Awaited<ReturnType<typeof getRecentItems>>;
}

const iconMap: Record<string, React.ElementType> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: Link2,
  File,
  Image: ImageIcon,
};

function formatRelativeTime(date: Date | null): string {
  if (!date) return "never";
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

// --- Sub-components ---

function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    { label: "Items", value: stats.totalItems, icon: Layers, color: "#3b82f6" },
    { label: "Collections", value: stats.totalCollections, icon: FolderOpen, color: "#8b5cf6" },
    { label: "Favorite Items", value: stats.favoriteItems, icon: Star, color: "#fde047" },
    { label: "Favorite Collections", value: stats.favoriteCollections, icon: Star, color: "#f97316" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="bg-card border border-border border-l-4 rounded-lg px-4 py-3 flex items-center gap-3"
          style={{ borderLeftColor: color }}
        >
          <div className="shrink-0 p-2 rounded-md bg-background">
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CollectionCard({ collection }: { collection: CollectionMeta }) {
  return (
    <div
      className="bg-card border border-border border-l-4 rounded-lg p-4 flex flex-col gap-2 relative group cursor-pointer hover:bg-card/80 transition-colors"
      style={{ borderLeftColor: collection.dominantTypeColor }}
    >
      {collection.isFavorite && (
        <Star className="absolute top-3 right-3 h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      )}
      <div className="pr-5">
        <p className="text-base font-semibold text-foreground truncate">{collection.name}</p>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{collection.description}</p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-1">
          {collection.itemTypes.map(({ typeId, icon, color }) => {
            const Icon = iconMap[icon] ?? File;
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
    </div>
  );
}

function PinnedItemCard({ item, onItemClick }: { item: DashboardItem; onItemClick: (id: string) => void }) {
  const { itemType } = item;
  const Icon = iconMap[itemType.icon] ?? File;
  const isUrl = item.contentType === "URL";

  return (
    <div
      className="bg-card border border-border border-l-4 rounded-lg p-4 flex flex-col gap-2 relative cursor-pointer hover:bg-card/80 transition-colors min-w-0"
      style={{ borderLeftColor: itemType.color }}
      onClick={() => onItemClick(item.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="shrink-0 flex items-center justify-center h-6 w-6 rounded-md"
            style={{ backgroundColor: itemType.color + "22" }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: itemType.color }} />
          </span>
          <p className="text-base font-semibold text-foreground truncate">{item.title}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {item.isFavorite && (
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          )}
          <Pin className="h-3.5 w-3.5 text-muted-foreground fill-muted-foreground" />
        </div>
      </div>

      {isUrl ? (
        <p className="text-sm text-blue-400 truncate">{item.url}</p>
      ) : (
        <pre className="text-xs text-muted-foreground bg-background rounded px-2 py-1.5 overflow-hidden line-clamp-3 font-mono whitespace-pre-wrap break-all">
          {item.content?.slice(0, 120)}
        </pre>
      )}

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {item.tags.map(({ tag }) => (
            <span
              key={tag.name}
              className="text-xs px-1.5 py-0.5 rounded bg-background text-muted-foreground border border-border"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentItemCard({ item, onItemClick }: { item: DashboardItem; onItemClick: (id: string) => void }) {
  const { itemType } = item;
  const Icon = iconMap[itemType.icon] ?? File;

  return (
    <div
      className="bg-card border border-border border-l-4 rounded-lg p-3 flex flex-col gap-2 cursor-pointer hover:bg-card/80 transition-colors"
      style={{ borderLeftColor: itemType.color }}
      onClick={() => onItemClick(item.id)}
    >
      <div className="flex items-center justify-between">
        <span
          className="flex items-center justify-center h-6 w-6 rounded-md shrink-0"
          style={{ backgroundColor: itemType.color + "22" }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: itemType.color }} />
        </span>
        {item.isFavorite && (
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
        )}
      </div>
      <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{item.title}</p>
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {item.tags.slice(0, 2).map(({ tag }) => (
            <span
              key={tag.name}
              className="text-xs px-1.5 py-0.5 rounded bg-background text-muted-foreground border border-border"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
        <Clock className="h-2.5 w-2.5" />
        {formatRelativeTime(item.lastUsedAt)}
      </p>
    </div>
  );
}

// --- Main export ---

export default function DashboardMain({
  stats,
  recentCollections,
  pinnedItems,
  recentItems,
}: DashboardMainProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
    <div className="space-y-6 pb-6">
      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Recent Collections */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Recent Collections</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {recentCollections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <Pin className="h-3.5 w-3.5 fill-foreground" />
            Pinned
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinnedItems.map((item) => (
              <PinnedItemCard key={item.id} item={item} onItemClick={setSelectedId} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">All Items</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {recentItems.map((item) => (
            <RecentItemCard key={item.id} item={item} onItemClick={setSelectedId} />
          ))}
        </div>
      </section>
    </div>
    <ItemDrawer itemId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
