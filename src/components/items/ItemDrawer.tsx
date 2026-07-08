"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { updateItem, deleteItem, toggleItemFavorite, toggleItemPin } from "@/actions/items";
import { DrawerSkeleton, type ItemFull } from "@/components/items/ItemDrawerParts";
import ItemDrawerView from "@/components/items/ItemDrawerView";
import ItemDrawerEdit, { type EditForm, initEditForm } from "@/components/items/ItemDrawerEdit";
import type { CollectionOption } from "@/components/items/CollectionMultiSelect";
import type { ItemWithType } from "@/lib/db/items";

const DRAWER_WIDTH_STORAGE_KEY = "devclustr-item-drawer-width";
const DEFAULT_DRAWER_WIDTH = 480;
const MIN_DRAWER_WIDTH = 480;
const MAX_DRAWER_WIDTH = 900;
const WIDTH_KEYBOARD_STEP = 20;

function getMaxDrawerWidth() {
  return Math.min(MAX_DRAWER_WIDTH, window.innerWidth * 0.9);
}

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
    collectionIds: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [availableCollections, setAvailableCollections] = useState<CollectionOption[]>([]);

  const [drawerWidth, setDrawerWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_DRAWER_WIDTH;
    const stored = Number(window.localStorage.getItem(DRAWER_WIDTH_STORAGE_KEY));
    return stored >= MIN_DRAWER_WIDTH && stored <= MAX_DRAWER_WIDTH ? stored : DEFAULT_DRAWER_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    function handleChange(e: MediaQueryListEvent) {
      setIsDesktop(e.matches);
    }
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  function handleResizeStart(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    resizeStartRef.current = { x: e.clientX, width: drawerWidth };
    setIsResizing(true);
  }

  function handleResizeKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setDrawerWidth((w) => Math.min(getMaxDrawerWidth(), w + WIDTH_KEYBOARD_STEP));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setDrawerWidth((w) => Math.max(MIN_DRAWER_WIDTH, w - WIDTH_KEYBOARD_STEP));
    }
  }

  useEffect(() => {
    if (!isResizing) return;

    function handlePointerMove(e: PointerEvent) {
      const start = resizeStartRef.current;
      if (!start) return;
      const next = start.width + (start.x - e.clientX);
      setDrawerWidth(Math.round(Math.min(getMaxDrawerWidth(), Math.max(MIN_DRAWER_WIDTH, next))));
    }

    function handlePointerUp() {
      setIsResizing(false);
      resizeStartRef.current = null;
    }

    const prevCursor = document.body.style.cursor;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevUserSelect;
    };
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) return;
    window.localStorage.setItem(DRAWER_WIDTH_STORAGE_KEY, String(drawerWidth));
  }, [drawerWidth, isResizing]);

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
    if (availableCollections.length === 0) {
      fetch("/api/collections")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setAvailableCollections(data));
    }
  }

  function handleFormChange(field: Exclude<keyof EditForm, "collectionIds">, value: string) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCollectionsChange(ids: string[]) {
    setEditForm((prev) => ({ ...prev, collectionIds: ids }));
  }

  async function handleFavorite() {
    if (!itemId) return;
    const result = await toggleItemFavorite(itemId);
    if (result.success) {
      setItem((prev) => prev ? { ...prev, isFavorite: result.isFavorite } : prev);
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to update favorite");
    }
  }

  async function handlePin() {
    if (!itemId) return;
    const result = await toggleItemPin(itemId);
    if (result.success) {
      setItem((prev) => prev ? { ...prev, isPinned: result.isPinned } : prev);
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to update pin");
    }
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
      collectionIds: editForm.collectionIds,
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
        style={isDesktop ? { width: drawerWidth, maxWidth: "90vw" } : { width: "100%", maxWidth: "none" }}
        className="p-0 flex flex-col gap-0"
      >
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize item drawer"
          aria-valuenow={drawerWidth}
          aria-valuemin={MIN_DRAWER_WIDTH}
          aria-valuemax={MAX_DRAWER_WIDTH}
          tabIndex={0}
          onPointerDown={handleResizeStart}
          onKeyDown={handleResizeKeyDown}
          className="hidden sm:block absolute inset-y-0 left-0 w-1.5 -translate-x-1/2 cursor-col-resize touch-none z-10 hover:bg-primary/40 active:bg-primary/60 focus-visible:bg-primary/60 outline-none transition-colors"
        />
        {loading && <DrawerSkeleton />}
        {!loading && item && !isEditing && (
          <ItemDrawerView item={item} onEdit={handleEdit} onDelete={handleDelete} onFavorite={handleFavorite} onPin={handlePin} isDeleting={isDeleting} />
        )}
        {!loading && item && isEditing && (
          <ItemDrawerEdit
            item={item}
            form={editForm}
            onChange={handleFormChange}
            onCollectionsChange={handleCollectionsChange}
            availableCollections={availableCollections}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            isSaving={isSaving}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
