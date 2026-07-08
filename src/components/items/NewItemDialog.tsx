"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { File } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { itemTypeIconMap } from "@/lib/item-type-icons";
import { createItem } from "@/actions/items";
import CodeEditor from "@/components/items/CodeEditor";
import MarkdownEditor from "@/components/items/MarkdownEditor";
import FileUpload, { type UploadedFile } from "@/components/items/FileUpload";
import CollectionMultiSelect, { type CollectionOption } from "@/components/items/CollectionMultiSelect";
import TagSuggestions from "@/components/items/TagSuggestions";
import SummarySuggestButton from "@/components/items/SummarySuggestButton";
import { useIsPro } from "@/contexts/IsProContext";
import type { SidebarItemType } from "@/components/dashboard/Sidebar";

const ALLOWED_TYPES = ["snippet", "prompt", "command", "note", "link", "file", "image"];

interface CreateForm {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
  collectionIds: string[];
  uploadedFile: UploadedFile | null;
}

function emptyForm(): CreateForm {
  return { title: "", description: "", content: "", url: "", language: "", tags: "", collectionIds: [], uploadedFile: null };
}

function DetailSection({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

interface NewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTypes: SidebarItemType[];
  initialTypeId?: string;
}

export default function NewItemDialog({ open, onOpenChange, itemTypes, initialTypeId }: NewItemDialogProps) {
  const router = useRouter();
  const isPro = useIsPro();
  const allowedTypes = itemTypes.filter((t) => ALLOWED_TYPES.includes(t.name.toLowerCase()));

  const defaultTypeId = () => {
    if (initialTypeId && allowedTypes.find((t) => t.id === initialTypeId)) return initialTypeId;
    return allowedTypes[0]?.id ?? "";
  };

  const [selectedTypeId, setSelectedTypeId] = useState<string>(defaultTypeId);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCollectionsLoading(true);
    fetch("/api/collections")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCollections(data))
      .finally(() => setCollectionsLoading(false));
  }, [open]);

  const selectedType = allowedTypes.find((t) => t.id === selectedTypeId) ?? allowedTypes[0];
  const typeName = selectedType?.name.toLowerCase() ?? "";
  const isLink = typeName === "link";
  const isFileType = typeName === "file" || typeName === "image";
  const showContent = !isLink && !isFileType;
  const showLanguage = typeName === "snippet" || typeName === "command";
  const showMarkdown = typeName === "note" || typeName === "prompt";

  function handleTypeSelect(id: string) {
    setSelectedTypeId(id);
    setForm(emptyForm());
  }

  function handleChange(field: Exclude<keyof CreateForm, "uploadedFile">, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(file: UploadedFile | null) {
    setForm((prev) => ({ ...prev, uploadedFile: file }));
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setForm(emptyForm());
      setSelectedTypeId(defaultTypeId());
    }
    onOpenChange(next);
  }

  async function handleSave() {
    if (!selectedType) return;
    setIsSaving(true);

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await createItem({
      typeId: selectedType.id,
      typeName: selectedType.name,
      title: form.title.trim(),
      description: form.description.trim() || null,
      content: form.content || null,
      url: form.url.trim() || null,
      language: form.language.trim() || null,
      tags,
      collectionIds: form.collectionIds,
      fileKey: form.uploadedFile?.key ?? null,
      fileName: form.uploadedFile?.fileName ?? null,
      fileSize: form.uploadedFile?.fileSize ?? null,
    });

    setIsSaving(false);

    if (result.success) {
      toast.success("Item created");
      handleOpenChange(false);
      router.refresh();
    } else {
      const err = result.error;
      toast.error(typeof err === "string" ? err : "Failed to create item");
    }
  }

  const canSave =
    form.title.trim().length > 0 &&
    (!isLink || form.url.trim().length > 0) &&
    (!isFileType || form.uploadedFile !== null);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        {/* Type selector */}
        <div className="flex gap-1.5 flex-wrap">
          {allowedTypes.map((type) => {
            const Icon = itemTypeIconMap[type.icon] ?? File;
            const isActive = type.id === selectedType?.id;
            return (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: isActive ? type.color : undefined }} />
                {type.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Item title"
              className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
            />
          </div>

          {/* Description */}
          <DetailSection
            label="Description"
            action={
              isPro && (
                <SummarySuggestButton
                  title={form.title}
                  content={form.content}
                  url={form.url}
                  language={form.language}
                  fileName={form.uploadedFile?.fileName ?? ""}
                  onGenerate={(summary) => handleChange("description", summary)}
                />
              )
            }
          >
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Optional description…"
              rows={2}
              className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground resize-none outline-none focus:border-primary placeholder:text-muted-foreground"
            />
          </DetailSection>

          {/* File / Image upload */}
          {isFileType && (
            <DetailSection label={typeName === "image" ? "Image" : "File"}>
              <FileUpload
                accept={typeName === "image" ? "image" : "file"}
                value={form.uploadedFile}
                onChange={handleFileChange}
              />
            </DetailSection>
          )}

          {/* Content (text types) */}
          {showContent && (
            <DetailSection label="Content">
              {showLanguage ? (
                <CodeEditor
                  value={form.content}
                  onChange={(v) => handleChange("content", v)}
                  language={form.language || undefined}
                />
              ) : showMarkdown ? (
                <MarkdownEditor
                  value={form.content}
                  onChange={(v) => handleChange("content", v)}
                  optimizable={typeName === "prompt"}
                />
              ) : (
                <textarea
                  value={form.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder="Content…"
                  rows={5}
                  className="w-full text-xs bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono resize-none outline-none focus:border-primary placeholder:text-muted-foreground"
                />
              )}
            </DetailSection>
          )}

          {/* URL (link type) */}
          {isLink && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                URL <span className="text-destructive">*</span>
              </label>
              <input
                value={form.url}
                onChange={(e) => handleChange("url", e.target.value)}
                type="url"
                placeholder="https://…"
                className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
              />
            </div>
          )}

          {/* Language (snippet / command) */}
          {showLanguage && (
            <DetailSection label="Language">
              <input
                value={form.language}
                onChange={(e) => handleChange("language", e.target.value)}
                placeholder="e.g. TypeScript, Bash…"
                className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
              />
            </DetailSection>
          )}

          {/* Tags */}
          <DetailSection label="Tags">
            <input
              value={form.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              placeholder="react, typescript, hooks"
              className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
            {isPro && (
              <div className="mt-2">
                <TagSuggestions
                  title={form.title}
                  description={form.description}
                  content={form.content}
                  existingTags={form.tags.split(",").map((t) => t.trim()).filter(Boolean)}
                  onAccept={(tag) => {
                    const current = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
                    if (!current.includes(tag)) {
                      handleChange("tags", [...current, tag].join(", "));
                    }
                  }}
                />
              </div>
            )}
          </DetailSection>

          {/* Collections */}
          <DetailSection label="Collections">
            <CollectionMultiSelect
              collections={collections}
              selected={form.collectionIds}
              onChange={(ids) => setForm((prev) => ({ ...prev, collectionIds: ids }))}
              loading={collectionsLoading}
            />
          </DetailSection>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !canSave}>
            {isSaving ? "Creating…" : "Create Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
