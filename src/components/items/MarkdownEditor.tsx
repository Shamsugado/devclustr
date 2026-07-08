"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Sparkles, Loader2, Crown, X } from "lucide-react";
import { toast } from "sonner";
import { useIsPro } from "@/contexts/IsProContext";
import { optimizePrompt } from "@/actions/ai";

const MIN_HEIGHT = 80;
const MAX_HEIGHT = 360;

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  optimizable?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = "Write markdown…",
  optimizable = false,
}: MarkdownEditorProps) {
  const isPro = useIsPro();
  const [tab, setTab] = useState<"write" | "preview" | "suggestion">(readOnly ? "preview" : "write");
  const [copied, setCopied] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
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

  async function handleOptimize() {
    if (isOptimizing || !value.trim()) return;
    setIsOptimizing(true);
    const result = await optimizePrompt({ content: value });
    setIsOptimizing(false);
    if (result.success) {
      setSuggestion(result.data);
      setTab("suggestion");
    } else {
      toast.error(result.error ?? "Failed to optimize prompt");
    }
  }

  function handleAcceptSuggestion() {
    if (!suggestion) return;
    onChange?.(suggestion);
    setSuggestion(null);
    setTab("write");
  }

  function handleRejectSuggestion() {
    setSuggestion(null);
    setTab("write");
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
          {suggestion && (
            <button
              type="button"
              onClick={() => setTab("suggestion")}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                tab === "suggestion"
                  ? "text-zinc-200 bg-white/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Suggested
            </button>
          )}
        </div>
        {optimizable && (
          isPro ? (
            <button
              type="button"
              onClick={handleOptimize}
              disabled={isOptimizing || !value.trim()}
              title={suggestion ? "Regenerate suggestion" : "Optimize this prompt"}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 transition-colors ml-2 disabled:opacity-50"
            >
              {isOptimizing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {isOptimizing ? "Optimizing…" : "Optimize"}
            </button>
          ) : (
            <span
              title="AI features require Pro subscription"
              className="flex items-center gap-1 text-xs text-zinc-600 ml-2 cursor-not-allowed"
            >
              <Crown className="h-3 w-3" />
              Optimize
            </span>
          )
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 transition-colors ml-auto"
        >
          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {tab === "suggestion" && suggestion && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-accent/40 border-b border-white/[0.08]">
          <span className="text-xs text-muted-foreground">Use this optimized version?</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAcceptSuggestion}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Check className="h-3 w-3" />
              Use this version
            </button>
            <button
              type="button"
              onClick={handleRejectSuggestion}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md text-muted-foreground hover:bg-accent transition-colors"
            >
              <X className="h-3 w-3" />
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#1e1e1e]" style={{ maxHeight: MAX_HEIGHT, overflowY: "auto" }}>
        {tab === "write" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight: MIN_HEIGHT, resize: "none", overflow: "hidden" }}
            className="w-full p-3 bg-transparent text-base text-zinc-200 outline-none placeholder:text-zinc-600"
          />
        ) : tab === "suggestion" && suggestion ? (
          <div className="markdown-preview min-h-20 p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{suggestion}</ReactMarkdown>
          </div>
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
