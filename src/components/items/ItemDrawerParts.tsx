"use client";

import { useState, useEffect } from "react";
import { Star, Pin, Copy, Pencil, Trash2, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ItemDetail } from "@/lib/db/items";

export type ItemFull = NonNullable<ItemDetail>;

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ""}`} />;
}

export function DrawerSkeleton() {
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

export function ActionBar({
  item,
  onEdit,
  onDelete,
  onFavorite,
  isDeleting,
}: {
  item: ItemFull;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: () => Promise<void>;
  isDeleting: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [isFav, setIsFav] = useState(item.isFavorite);
  const isFile = item.contentType === "FILE";

  useEffect(() => {
    setIsFav(item.isFavorite);
  }, [item.id, item.isFavorite]);

  async function handleFavorite() {
    setIsFav((prev) => !prev);
    await onFavorite();
  }

  async function handleCopy() {
    const text = item.contentType === "URL" ? (item.url ?? "") : (item.content ?? "");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-1 py-3 border-b border-border">
      <button onClick={handleFavorite} title={isFav ? "Remove from favorites" : "Add to favorites"} className="flex items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
        <Star className={`h-4 w-4 ${isFav ? "fill-yellow-400 text-yellow-400" : ""}`} />
      </button>
      <button title="Pin" className="flex items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
        <Pin className={`h-4 w-4 ${item.isPinned ? "fill-foreground text-foreground" : ""}`} />
      </button>
      {isFile ? (
        <a
          href={`/api/items/${item.id}/download`}
          title="Download"
          className="flex items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Download className="h-4 w-4" />
        </a>
      ) : (
        <button
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy"}
          className="flex items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Copy className={`h-4 w-4 ${copied ? "text-green-400" : ""}`} />
        </button>
      )}
      <button
        onClick={onEdit}
        title="Edit"
        className="flex items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <AlertDialog>
        <AlertDialogTrigger
          disabled={isDeleting}
          title="Delete"
          className="flex items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-red-400 transition-colors ml-auto disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{item.title}&rdquo; will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function EditBar({
  onSave,
  onCancel,
  isSaving,
  canSave,
}: {
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  canSave: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-3 border-b border-border">
      <button
        onClick={onCancel}
        disabled={isSaving}
        className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={isSaving || !canSave}
        className="px-3 py-1.5 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 ml-auto"
      >
        {isSaving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

export function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}
