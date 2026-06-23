"use client";

import { useState } from "react";
import { Star, Clock, File, Copy, Check } from "lucide-react";
import { itemTypeIconMap } from "@/lib/item-type-icons";
import type { ItemWithType } from "@/lib/db/items";
import { formatRelativeTime } from "@/lib/format";

export default function ItemCard({ item, onClick }: { item: ItemWithType; onClick?: () => void }) {
  const { itemType } = item;
  const Icon = itemTypeIconMap[itemType.icon] ?? File;
  const isUrl = item.contentType === "URL";
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const text = isUrl ? (item.url ?? "") : (item.content ?? "");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const CopyIcon = copied ? Check : Copy;

  return (
    <div
      className="bg-card border border-border border-l-4 rounded-lg p-4 flex flex-col gap-2 cursor-pointer hover:bg-card/80 transition-colors group"
      style={{ borderLeftColor: itemType.color }}
      onClick={onClick}
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
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-muted-foreground hover:text-foreground"
            title="Copy"
          >
            <CopyIcon className={`h-3.5 w-3.5 ${copied ? "text-green-400" : ""}`} />
          </button>
          {item.isFavorite && (
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          )}
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

      <p className="text-xs text-muted-foreground/60 flex items-center gap-1 mt-auto">
        <Clock className="h-2.5 w-2.5" />
        {formatRelativeTime(item.lastUsedAt)}
      </p>
    </div>
  );
}
