"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";

const MIN_HEIGHT = 80;
const MAX_HEIGHT = 360;

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = "Write markdown…",
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">(readOnly ? "preview" : "write");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (tab !== "write") return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT)}px`;
  }, [value, tab]);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-md overflow-hidden border border-border">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border-b border-white/[0.08]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-0.5 ml-2">
          {!readOnly && (
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                tab === "write"
                  ? "text-zinc-200 bg-white/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Write
            </button>
          )}
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`text-xs px-2 py-0.5 rounded transition-colors ${
              tab === "preview"
                ? "text-zinc-200 bg-white/10"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Preview
          </button>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 transition-colors ml-auto"
        >
          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="bg-[#1e1e1e]" style={{ maxHeight: MAX_HEIGHT, overflowY: "auto" }}>
        {tab === "write" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight: MIN_HEIGHT, resize: "none", overflow: "hidden" }}
            className="w-full p-3 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
          />
        ) : (
          <div className="markdown-preview min-h-20 p-4">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-zinc-600 text-sm italic">Nothing to preview</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
