"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Pin, Copy, Pencil, Trash2, File, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { itemTypeIconMap } from "@/lib/item-type-icons";
import { updateItem, deleteItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";

type ItemFull = NonNullable<ItemDetail>;

interface EditForm {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
}

function initEditForm(item: ItemFull): EditForm {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    url: item.url ?? "",
    language: item.language ?? "",
    tags: item.tags.map(({ tag }) => tag.name).join(", "),
  };
}

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

function ActionBar({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: ItemFull;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
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
      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <Pencil className="h-4 w-4" />
        Edit
      </button>
      <AlertDialog>
        <AlertDialogTrigger
          disabled={isDeleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-red-400 transition-colors ml-auto disabled:opacity-50"
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

function EditBar({
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

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

function ItemDrawerContent({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: ItemFull;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
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
        <ActionBar item={item} onEdit={onEdit} onDelete={onDelete} isDeleting={isDeleting} />
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

function ItemDrawerEditContent({
  item,
  form,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: {
  item: ItemFull;
  form: EditForm;
  onChange: (field: keyof EditForm, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const { itemType } = item;
  const Icon = itemTypeIconMap[itemType.icon] ?? File;
  const isUrl = item.contentType === "URL";
  const typeName = itemType.name.toLowerCase();
  const showLanguage = typeName === "snippet" || typeName === "command";

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
          <input
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Title"
            className="flex-1 min-w-0 text-lg font-semibold bg-transparent text-foreground border-b border-border focus:border-primary outline-none py-0.5 leading-snug"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-md bg-accent text-muted-foreground">
            {itemType.name}
          </span>
          {showLanguage && (
            <input
              value={form.language}
              onChange={(e) => onChange("language", e.target.value)}
              placeholder="Language"
              className="text-xs px-2 py-0.5 rounded-md bg-background border border-border text-muted-foreground outline-none focus:border-primary w-24"
            />
          )}
        </div>
      </SheetHeader>

      <div className="px-6">
        <EditBar
          onSave={onSave}
          onCancel={onCancel}
          isSaving={isSaving}
          canSave={form.title.trim().length > 0}
        />
      </div>

      <div className="px-6 pb-6 flex flex-col gap-5 overflow-y-auto">
        <DetailSection label="Description">
          <textarea
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Optional description…"
            rows={3}
            className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground resize-none outline-none focus:border-primary placeholder:text-muted-foreground"
          />
        </DetailSection>

        {!isUrl && (
          <DetailSection label="Content">
            <textarea
              value={form.content}
              onChange={(e) => onChange("content", e.target.value)}
              placeholder="Content…"
              rows={8}
              className="w-full text-xs bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono resize-none outline-none focus:border-primary placeholder:text-muted-foreground"
            />
          </DetailSection>
        )}

        {isUrl && (
          <DetailSection label="URL">
            <input
              value={form.url}
              onChange={(e) => onChange("url", e.target.value)}
              type="url"
              placeholder="https://…"
              className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
            />
          </DetailSection>
        )}

        <DetailSection label="Tags">
          <input
            value={form.tags}
            onChange={(e) => onChange("tags", e.target.value)}
            placeholder="react, typescript, hooks"
            className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
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

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      setIsEditing(false);
      return;
    }
    setLoading(true);
    setItem(null);
    setIsEditing(false);
    fetch(`/api/items/${itemId}`)
      .then((r) => r.json())
      .then((data) => setItem(data))
      .finally(() => setLoading(false));
  }, [itemId]);

  function handleEdit() {
    if (!item) return;
    setEditForm(initEditForm(item));
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
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
          <ItemDrawerContent item={item} onEdit={handleEdit} onDelete={handleDelete} isDeleting={isDeleting} />
        )}
        {!loading && item && isEditing && (
          <ItemDrawerEditContent
            item={item}
            form={editForm}
            onChange={handleFormChange}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
