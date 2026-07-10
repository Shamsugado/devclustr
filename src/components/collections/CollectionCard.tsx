"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, File, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { CollectionMeta } from "@/lib/db/collections";
import { itemTypeIconMap } from "@/lib/item-type-icons";
import { deleteCollection, toggleCollectionFavorite } from "@/actions/collections";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import CollectionFormDialog from "@/components/collections/CollectionFormDialog";

export default function CollectionCard({ collection }: { collection: CollectionMeta }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFav, setIsFav] = useState(collection.isFavorite);

  async function handleFavorite() {
    setIsFav((prev) => !prev);
    const result = await toggleCollectionFavorite(collection.id);
    if (!result.success) {
      setIsFav((prev) => !prev);
    } else {
      router.refresh();
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteCollection({ id: collection.id });
    setIsDeleting(false);

    if (result.success) {
      toast.success("Collection deleted");
      setDeleteOpen(false);
      router.refresh();
    } else {
      toast.error(typeof result.error === "string" ? result.error : "Failed to delete collection");
    }
  }

  return (
    <>
      <Link
        href={`/collections/${collection.id}`}
        className="bg-card border border-border border-l-4 rounded-lg p-4 flex flex-col gap-2 relative group hover:bg-card/80 transition-colors"
        style={{ borderLeftColor: collection.dominantTypeColor }}
      >
        {isFav && (
          <Star className="absolute top-3 right-8 h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
        )}

        {/* 3-dots menu — stopPropagation prevents Link navigation */}
        <div
          className="absolute top-2 right-2"
          onClick={(e) => e.preventDefault()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center justify-center h-6 w-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Collection actions"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFavorite}>
                <Star className={isFav ? "fill-yellow-400 text-yellow-400" : ""} />
                {isFav ? "Unfavorite" : "Favorite"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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

      <CollectionFormDialog
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogTrigger className="hidden" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{collection.name}&quot; will be permanently deleted. Items inside will not be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
