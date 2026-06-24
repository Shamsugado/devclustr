"use client";

import { File } from "lucide-react";
import { SheetHeader } from "@/components/ui/sheet";
import { itemTypeIconMap } from "@/lib/item-type-icons";
import CodeEditor from "@/components/items/CodeEditor";
import MarkdownEditor from "@/components/items/MarkdownEditor";
import CollectionMultiSelect, { type CollectionOption } from "@/components/items/CollectionMultiSelect";
import { EditBar, DetailSection, type ItemFull } from "@/components/items/ItemDrawerParts";

export interface EditForm {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
  collectionIds: string[];
}

export function initEditForm(item: ItemFull): EditForm {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    url: item.url ?? "",
    language: item.language ?? "",
    tags: item.tags.map(({ tag }) => tag.name).join(", "),
    collectionIds: item.collections.map(({ collection }) => collection.id),
  };
}

export default function ItemDrawerEdit({
  item,
  form,
  onChange,
  onCollectionsChange,
  availableCollections,
  onSave,
  onCancel,
  isSaving,
}: {
  item: ItemFull;
  form: EditForm;
  onChange: (field: Exclude<keyof EditForm, "collectionIds">, value: string) => void;
  onCollectionsChange: (ids: string[]) => void;
  availableCollections: CollectionOption[];
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const { itemType } = item;
  const Icon = itemTypeIconMap[itemType.icon] ?? File;
  const isUrl = item.contentType === "URL";
  const typeName = itemType.name.toLowerCase();
  const showLanguage = typeName === "snippet" || typeName === "command";
  const showMarkdown = typeName === "note" || typeName === "prompt";

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
            {showLanguage ? (
              <CodeEditor
                value={form.content}
                onChange={(v) => onChange("content", v)}
                language={form.language || undefined}
              />
            ) : showMarkdown ? (
              <MarkdownEditor
                value={form.content}
                onChange={(v) => onChange("content", v)}
              />
            ) : (
              <textarea
                value={form.content}
                onChange={(e) => onChange("content", e.target.value)}
                placeholder="Content…"
                rows={8}
                className="w-full text-xs bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono resize-none outline-none focus:border-primary placeholder:text-muted-foreground"
              />
            )}
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

        <DetailSection label="Collections">
          <CollectionMultiSelect
            collections={availableCollections}
            selected={form.collectionIds}
            onChange={onCollectionsChange}
          />
        </DetailSection>
      </div>
    </>
  );
}
