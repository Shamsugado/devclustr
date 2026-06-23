import { Download, File, FileText, FileCode, FileImage, FileArchive, FileAudio, FileVideo } from "lucide-react";
import type { ItemWithType } from "@/lib/db/items";

function getExtension(fileName: string | null): string {
  if (!fileName) return "";
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "";
}

function fileIconForExt(ext: string) {
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) return FileImage;
  if (["pdf", "doc", "docx", "txt", "md", "rtf"].includes(ext)) return FileText;
  if (["js", "ts", "jsx", "tsx", "py", "rb", "go", "rs", "java", "c", "cpp", "cs", "php", "html", "css", "json", "yaml", "yml", "xml", "sh"].includes(ext)) return FileCode;
  if (["zip", "tar", "gz", "bz2", "rar", "7z"].includes(ext)) return FileArchive;
  if (["mp3", "wav", "ogg", "flac", "aac"].includes(ext)) return FileAudio;
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return FileVideo;
  return File;
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(date: Date | string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function FileRow({
  item,
  onClick,
}: {
  item: ItemWithType;
  onClick?: () => void;
}) {
  const ext = getExtension(item.fileName);
  const Icon = fileIconForExt(ext);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-accent/30 transition-colors"
      onClick={onClick}
    >
      <span className="shrink-0 flex items-center justify-center h-9 w-9 rounded-md bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
        {item.fileName && item.fileName !== item.title && (
          <p className="text-xs text-muted-foreground truncate">{item.fileName}</p>
        )}
        <div className="flex items-center gap-2 mt-0.5 sm:hidden">
          {item.fileSize !== null && (
            <span className="text-xs text-muted-foreground">{formatBytes(item.fileSize)}</span>
          )}
          <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-6 shrink-0 text-xs text-muted-foreground">
        <span className="w-16 text-right">{formatBytes(item.fileSize)}</span>
        <span className="w-28 text-right">{formatDate(item.createdAt)}</span>
      </div>

      <a
        href={`/api/items/${item.id}/download`}
        download
        className="shrink-0 flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        onClick={(e) => e.stopPropagation()}
        title="Download"
      >
        <Download className="h-4 w-4" />
      </a>
    </div>
  );
}
