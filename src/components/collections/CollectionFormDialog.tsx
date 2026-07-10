"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createCollection, updateCollection } from "@/actions/collections";

interface CollectionForm {
  name: string;
  description: string;
}

function emptyForm(): CollectionForm {
  return { name: "", description: "" };
}

interface CollectionFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection?: { id: string; name: string; description: string | null };
}

export default function CollectionFormDialog({
  mode,
  open,
  onOpenChange,
  collection,
}: CollectionFormDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<CollectionForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      mode === "edit" && collection
        ? { name: collection.name, description: collection.description ?? "" }
        : emptyForm()
    );
  }, [open, mode, collection]);

  function handleChange(field: keyof CollectionForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setIsSaving(true);

    const result =
      mode === "edit" && collection
        ? await updateCollection({
            id: collection.id,
            name: form.name.trim(),
            description: form.description.trim() || null,
          })
        : await createCollection({
            name: form.name.trim(),
            description: form.description.trim() || null,
          });

    setIsSaving(false);

    if (result.success) {
      toast.success(mode === "edit" ? "Collection updated" : "Collection created");
      onOpenChange(false);
      router.refresh();
    } else {
      const err = result.error;
      toast.error(
        typeof err === "string"
          ? err
          : mode === "edit"
            ? "Failed to update collection"
            : "Failed to create collection"
      );
    }
  }

  const canSave = form.name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Collection" : "New Collection"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Collection name"
              className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </p>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Optional description…"
              rows={3}
              className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground resize-none outline-none focus:border-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !canSave}>
            {isSaving
              ? mode === "edit"
                ? "Saving…"
                : "Creating…"
              : mode === "edit"
                ? "Save Changes"
                : "Create Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
