"use client";

import { File, Calendar } from "lucide-react";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { itemTypeIconMap } from "@/lib/item-type-icons";
import { formatBytes } from "@/lib/format";
import CodeEditor from "@/components/items/CodeEditor";
import MarkdownEditor from "@/components/items/MarkdownEditor";
import { ActionBar, DetailSection, type ItemFull } from "@/components/items/ItemDrawerParts";

const formatDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function ItemDrawerView({
  item,
  onEdit,
  onDelete,
  onFavorite,
  isDeleting,
}: {
  item: ItemFull;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: () => Promise<void>;
  isDeleting: boolean;
}) {
  const { itemType } = item;
  const Icon = itemTypeIconMap[itemType.icon] ?? File;
  const isUrl = item.contentType === "URL";
  const isFileContent = item.contentType === "FILE";
  const typeName = itemType.name.toLowerCase();
  const isCodeType = typeName === "snippet" || typeName === "command";
  const isMarkdownType = typeName === "note" || typeName === "prompt";
  const isImageType = typeName === "image";

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
        <ActionBar item={item} onEdit={onEdit} onDelete={onDelete} onFavorite={onFavorite} isDeleting={isDeleting} />
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
          ) : isFileContent ? (
            isImageType ? (
              <div className="rounded-md overflow-hidden border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/items/${item.id}/download`}
                  alt={item.title}
                  className="w-full max-h-80 object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 border border-border rounded-md p-3 bg-background">
                <File className="h-8 w-8 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.fileName}</p>
                  {item.fileSize != null && (
                    <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(item.fileSize)}</p>
                  )}
                </div>
              </div>
            )
          ) : isCodeType ? (
            <CodeEditor
              value={item.content ?? ""}
              language={item.language ?? undefined}
              readOnly
            />
          ) : isMarkdownType ? (
            <MarkdownEditor value={item.content ?? ""} readOnly />
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
