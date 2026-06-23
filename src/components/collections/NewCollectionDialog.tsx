"use client";

import { useState } from "react";
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
import { createCollection } from "@/actions/collections";

interface CreateForm {
  name: string;
  description: string;
}

function emptyForm(): CreateForm {
  return { name: "", description: "" };
}

interface NewCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewCollectionDialog({ open, onOpenChange }: NewCollectionDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(field: keyof CreateForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleOpenChange(next: boolean) {
    if (!next) setForm(emptyForm());
    onOpenChange(next);
  }

  async function handleSave() {
    setIsSaving(true);

    const result = await createCollection({
      name: form.name.trim(),
      description: form.description.trim() || null,
    });

    setIsSaving(false);

    if (result.success) {
      toast.success("Collection created");
      handleOpenChange(false);
      router.refresh();
    } else {
      const err = result.error;
      toast.error(typeof err === "string" ? err : "Failed to create collection");
    }
  }

  const canSave = form.name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>New Collection</DialogTitle>
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
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !canSave}>
            {isSaving ? "Creating…" : "Create Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
