"use client";

import { useEffect, useState } from "react";
import { Star, Pin, Copy, Pencil, Trash2, File, Calendar, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { itemTypeIconMap } from "@/lib/item-type-icons";
import type { ItemDetail } from "@/lib/db/items";

type ItemFull = NonNullable<ItemDetail>;

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ""}`} />;
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <div className="flex gap-2 mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16" />
        ))}
      </div>
      <Skeleton className="h-4 w-1/4 mt-4" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-4 w-1/4 mt-2" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

function ActionBar({ item }: { item: ItemFull }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = item.contentType === "URL" ? (item.url ?? "") : (item.content ?? "");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-1 py-3 border-b border-border">
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
        <Star className={`h-4 w-4 ${item.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
        Favorite
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
        <Pin className={`h-4 w-4 ${item.isPinned ? "fill-foreground text-foreground" : ""}`} />
        Pin
      </button>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <Copy className="h-4 w-4" />
        {copied ? "Copied!" : "Copy"}
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
        <Pencil className="h-4 w-4" />
        Edit
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-red-400 transition-colors ml-auto">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

function ItemDrawerContent({ item }: { item: ItemFull }) {
  const { itemType } = item;
  const Icon = itemTypeIconMap[itemType.icon] ?? File;
  const isUrl = item.contentType === "URL";

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <>
      <SheetHeader className="px-6 pt-6 pb-0 space-y-3">
        <div className="flex items-center gap-3 pr-6">
          <span
            className="shrink-0 flex items-center justify-center h-8 w-8 rounded-md"
            style={{ backgroundColor: itemType.color + "22" }}
          >
            <Icon className="h-4 w-4" style={{ color: itemType.color }} />
          </span>
          <SheetTitle className="text-lg font-semibold text-foreground leading-snug">
            {item.title}
          </SheetTitle>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-md bg-accent text-muted-foreground">
            {itemType.name}
          </span>
          {item.language && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-accent text-muted-foreground">
              {item.language}
            </span>
          )}
        </div>
      </SheetHeader>

      <div className="px-6">
        <ActionBar item={item} />
      </div>

      <div className="px-6 pb-6 flex flex-col gap-5 overflow-y-auto">
        {item.description && (
          <DetailSection label="Description">
            <p className="text-sm text-foreground">{item.description}</p>
          </DetailSection>
        )}

        <DetailSection label="Content">
          {isUrl ? (
            <a
              href={item.url ?? ""}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:underline break-all"
            >
              {item.url}
            </a>
          ) : (
            <pre className="text-xs text-muted-foreground bg-background rounded-md p-3 overflow-x-auto font-mono whitespace-pre-wrap break-all border border-border max-h-64">
              {item.content}
            </pre>
          )}
        </DetailSection>

        {item.tags.length > 0 && (
          <DetailSection label="Tags">
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map(({ tag }) => (
                <span
                  key={tag.name}
                  className="text-xs px-2 py-0.5 rounded-md bg-background text-muted-foreground border border-border"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </DetailSection>
        )}

        {item.collections.length > 0 && (
          <DetailSection label="Collections">
            <div className="flex flex-wrap gap-1.5">
              {item.collections.map(({ collection }) => (
                <span
                  key={collection.id}
                  className="text-xs px-2 py-0.5 rounded-md bg-accent text-muted-foreground border border-border"
                >
                  {collection.name}
                </span>
              ))}
            </div>
          </DetailSection>
        )}

        <DetailSection label="Details">
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Created
              </span>
              <span>{formatDate(item.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Updated
              </span>
              <span>{formatDate(item.updatedAt)}</span>
            </div>
          </div>
        </DetailSection>
      </div>
    </>
  );
}

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

export default function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemFull | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      return;
    }
    setLoading(true);
    setItem(null);
    fetch(`/api/items/${itemId}`)
      .then((r) => r.json())
      .then((data) => setItem(data))
      .finally(() => setLoading(false));
  }, [itemId]);

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] sm:max-w-[480px] p-0 flex flex-col gap-0"
      >
        {loading && <DrawerSkeleton />}
        {!loading && item && <ItemDrawerContent item={item} />}
      </SheetContent>
    </Sheet>
  );
}
