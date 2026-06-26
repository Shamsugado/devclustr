"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCollection, toggleCollectionFavorite } from "@/actions/collections";
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
import EditCollectionDialog from "@/components/collections/EditCollectionDialog";

interface CollectionDetailActionsProps {
  collection: { id: string; name: string; description: string | null; isFavorite: boolean };
}

export default function CollectionDetailActions({ collection }: CollectionDetailActionsProps) {
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
      router.push("/collections");
      router.refresh();
    } else {
      toast.error(typeof result.error === "string" ? result.error : "Failed to delete collection");
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-yellow-400"
          onClick={handleFavorite}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={`h-4 w-4 ${isFav ? "fill-yellow-400 text-yellow-400" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <EditCollectionDialog
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
