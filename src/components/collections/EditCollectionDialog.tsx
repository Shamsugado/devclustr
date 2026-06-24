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
import { updateCollection } from "@/actions/collections";

interface EditForm {
  name: string;
  description: string;
}

interface EditCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: { id: string; name: string; description: string | null };
}

export default function EditCollectionDialog({
  open,
  onOpenChange,
  collection,
}: EditCollectionDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<EditForm>({
    name: collection.name,
    description: collection.description ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ name: collection.name, description: collection.description ?? "" });
    }
  }, [open, collection]);

  function handleChange(field: keyof EditForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setIsSaving(true);

    const result = await updateCollection({
      id: collection.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
    });

    setIsSaving(false);

    if (result.success) {
      toast.success("Collection updated");
      onOpenChange(false);
      router.refresh();
    } else {
      const err = result.error;
      toast.error(typeof err === "string" ? err : "Failed to update collection");
    }
  }

  const canSave = form.name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
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
            {isSaving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
