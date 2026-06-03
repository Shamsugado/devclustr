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
import { mockCollections, mockItems, mockItemTypes } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: Link2,
  File,
  Image: ImageIcon,
};

function getItemType(typeId: string) {
  return mockItemTypes.find((t) => t.id === typeId);
}

function getCollectionTypeIds(collectionId: string): string[] {
  return [
    ...new Set(
      mockItems
        .filter((item) => item.collectionIds.includes(collectionId))
        .map((item) => item.itemTypeId)
    ),
  ];
}

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

// Derived data
const totalItems = mockItems.length;
const totalCollections = mockCollections.length;
const favoriteItems = mockItems.filter((i) => i.isFavorite).length;
const favoriteCollections = mockCollections.filter((c) => c.isFavorite).length;

const pinnedItems = mockItems.filter((item) => item.isPinned);

const recentItems = [...mockItems].sort(
  (a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
);

// Recent collections: ordered by most recently used item in each collection
function getRecentCollections() {
  const seen = new Set<string>();
  const ordered: string[] = [];
  [...mockItems]
    .sort((a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime())
    .forEach((item) => {
      item.collectionIds.forEach((id) => {
        if (!seen.has(id)) {
          seen.add(id);
          ordered.push(id);
        }
      });
    });
  return ordered
    .map((id) => mockCollections.find((c) => c.id === id))
    .filter((c): c is (typeof mockCollections)[0] => Boolean(c));
}

const recentCollections = getRecentCollections();

// --- Sub-components ---

function StatsCards() {
  const cards = [
    { label: "Items", value: totalItems, icon: Layers, color: "#3b82f6" },
    { label: "Collections", value: totalCollections, icon: FolderOpen, color: "#8b5cf6" },
    { label: "Favorite Items", value: favoriteItems, icon: Star, color: "#fde047" },
    { label: "Favorite Collections", value: favoriteCollections, icon: Star, color: "#f97316" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="shrink-0 p-2 rounded-md bg-background">
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CollectionCard({ collection }: { collection: (typeof mockCollections)[0] }) {
  const typeIds = getCollectionTypeIds(collection.id);

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2 relative group cursor-pointer hover:border-border/80 hover:bg-card/80 transition-colors">
      {collection.isFavorite && (
        <Star className="absolute top-3 right-3 h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      )}
      <div className="pr-5">
        <p className="text-sm font-semibold text-foreground truncate">{collection.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{collection.description}</p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-1">
          {typeIds.map((typeId) => {
            const type = getItemType(typeId);
            if (!type) return null;
            const Icon = iconMap[type.icon] ?? File;
            return (
              <span
                key={typeId}
                className="flex items-center justify-center h-5 w-5 rounded-sm"
                style={{ backgroundColor: type.color + "22" }}
              >
                <Icon className="h-3 w-3" style={{ color: type.color }} />
              </span>
            );
          })}
        </div>
        <span className="text-[11px] text-muted-foreground">{collection.itemCount} items</span>
      </div>
    </div>
  );
}

function PinnedItemCard({ item }: { item: (typeof mockItems)[0] }) {
  const type = getItemType(item.itemTypeId);
  const Icon = type ? (iconMap[type.icon] ?? File) : File;
  const isUrl = item.contentType === "url";

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2 relative cursor-pointer hover:border-border/80 hover:bg-card/80 transition-colors min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="shrink-0 flex items-center justify-center h-6 w-6 rounded-md"
            style={{ backgroundColor: (type?.color ?? "#6b7280") + "22" }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: type?.color ?? "#6b7280" }} />
          </span>
          <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {item.isFavorite && (
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          )}
          <Pin className="h-3.5 w-3.5 text-muted-foreground fill-muted-foreground" />
        </div>
      </div>

      {isUrl ? (
        <p className="text-xs text-blue-400 truncate">{item.url}</p>
      ) : (
        <pre className="text-[11px] text-muted-foreground bg-background rounded px-2 py-1.5 overflow-hidden line-clamp-3 font-mono whitespace-pre-wrap break-all">
          {item.content?.slice(0, 120)}
        </pre>
      )}

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-background text-muted-foreground border border-border"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentItemCard({ item }: { item: (typeof mockItems)[0] }) {
  const type = getItemType(item.itemTypeId);
  const Icon = type ? (iconMap[type.icon] ?? File) : File;

  return (
    <div className="bg-card border border-border rounded-lg p-3 flex flex-col gap-2 cursor-pointer hover:border-border/80 hover:bg-card/80 transition-colors">
      <div className="flex items-center justify-between">
        <span
          className="flex items-center justify-center h-6 w-6 rounded-md shrink-0"
          style={{ backgroundColor: (type?.color ?? "#6b7280") + "22" }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: type?.color ?? "#6b7280" }} />
        </span>
        {item.isFavorite && (
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
        )}
      </div>
      <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">{item.title}</p>
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-background text-muted-foreground border border-border"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
        <Clock className="h-2.5 w-2.5" />
        {formatRelativeTime(item.lastUsedAt)}
      </p>
    </div>
  );
}

// --- Main export ---

export default function DashboardMain() {
  return (
    <div className="space-y-6 pb-6">
      {/* Stats */}
      <StatsCards />

      {/* Recent Collections */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3">Recent Collections</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {recentCollections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      </section>

      {/* Pinned Items */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
          <Pin className="h-3.5 w-3.5 fill-foreground" />
          Pinned
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pinnedItems.map((item) => (
            <PinnedItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Recent Items */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3">All Items</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {recentItems.map((item) => (
            <RecentItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
