"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { updateItem, deleteItem } from "@/actions/items";
import { DrawerSkeleton, type ItemFull } from "@/components/items/ItemDrawerParts";
import ItemDrawerView from "@/components/items/ItemDrawerView";
import ItemDrawerEdit, { type EditForm, initEditForm } from "@/components/items/ItemDrawerEdit";
import type { ItemWithType } from "@/lib/db/items";

interface ItemDrawerProps {
  itemId: string | null;
  initialData?: ItemWithType;
  onClose: () => void;
}

export default function ItemDrawer({ itemId, initialData, onClose }: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    title: "",
    description: "",
    content: "",
    url: "",
    language: "",
    tags: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Capture initialData without adding it to effect deps
  const initialDataRef = useRef(initialData);
  initialDataRef.current = initialData;

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      setIsEditing(false);
      return;
    }
    setIsEditing(false);
    const seed = initialDataRef.current;
    if (seed) {
      // Render immediately from card data; fetch updates collections in background
      setItem({ ...seed, collections: [] } as ItemFull);
    } else {
      setLoading(true);
      setItem(null);
    }
    fetch(`/api/items/${itemId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setItem(data); })
      .finally(() => setLoading(false));
  }, [itemId]);

  function handleEdit() {
    if (!item) return;
    setEditForm(initEditForm(item));
    setIsEditing(true);
  }

  function handleFormChange(field: keyof EditForm, value: string) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleDelete() {
    if (!itemId) return;
    setIsDeleting(true);
    const result = await deleteItem(itemId);
    setIsDeleting(false);
    if (result.success) {
      toast.success("Item deleted");
      onClose();
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to delete item");
    }
  }

  async function handleSave() {
    if (!item || !itemId) return;
    setIsSaving(true);

    const tags = editForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await updateItem(itemId, {
      title: editForm.title.trim(),
      description: editForm.description.trim() || null,
      content: editForm.content || null,
      url: editForm.url.trim() || null,
      language: editForm.language.trim() || null,
      tags,
    });

    setIsSaving(false);

    if (result.success) {
      setItem(result.data as ItemFull);
      setIsEditing(false);
      router.refresh();
      toast.success("Item saved");
    } else {
      toast.error(typeof result.error === "string" ? result.error : "Failed to save item");
    }
  }

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:w-120 sm:max-w-120 p-0 flex flex-col gap-0"
      >
        {loading && <DrawerSkeleton />}
        {!loading && item && !isEditing && (
          <ItemDrawerView item={item} onEdit={handleEdit} onDelete={handleDelete} isDeleting={isDeleting} />
        )}
        {!loading && item && isEditing && (
          <ItemDrawerEdit
            item={item}
            form={editForm}
            onChange={handleFormChange}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            isSaving={isSaving}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
