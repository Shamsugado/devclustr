"use client";

import { useRef, useState } from "react";
import { Upload, X, File as FileIcon, Image as ImageIcon } from "lucide-react";

export interface UploadedFile {
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isImage: boolean;
}

interface FileUploadProps {
  accept: "image" | "file";
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.gif,.webp,.svg";
const FILE_ACCEPT = ".pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini";

export default function FileUpload({ accept, value, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        setProgress(null);
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText) as UploadedFile;
          onChange(data);
          resolve();
        } else {
          let msg = "Upload failed";
          try {
            msg = (JSON.parse(xhr.responseText) as { error: string }).error ?? msg;
          } catch {}
          setError(msg);
          reject(new Error(msg));
        }
      };

      xhr.onerror = () => {
        setProgress(null);
        setError("Upload failed");
        reject(new Error("Upload failed"));
      };

      xhr.send(formData);
    });
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  const isUploading = progress !== null;
  const acceptStr = accept === "image" ? IMAGE_ACCEPT : FILE_ACCEPT;
  const Icon = accept === "image" ? ImageIcon : FileIcon;

  if (value) {
    return (
      <div className="border border-border rounded-md p-3 flex items-start gap-3">
        {value.isImage ? (
          <div className="shrink-0 h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        ) : (
          <div className="shrink-0 h-12 w-12 rounded bg-muted flex items-center justify-center">
            <FileIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{value.fileName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(value.fileSize)}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/30"
        }`}
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptStr}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Icon className="h-6 w-6 text-muted-foreground" />
        {isUploading ? (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Uploading…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              {accept === "image"
                ? "PNG, JPG, GIF, WebP, SVG — up to 5 MB"
                : "PDF, TXT, MD, JSON, YAML, XML, CSV, TOML, INI — up to 10 MB"}
            </p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {!isUploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Upload className="h-3 w-3" />
          Choose file
        </button>
      )}
    </div>
  );
}
