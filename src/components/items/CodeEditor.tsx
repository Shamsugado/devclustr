"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { OnMount } from "@monaco-editor/react";
import { Copy, Check, Sparkles, Loader2, Crown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useEditorSettings } from "@/contexts/EditorSettingsContext";
import { useIsPro } from "@/contexts/IsProContext";
import { explainCode } from "@/actions/ai";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const MIN_HEIGHT = 80;
const MAX_HEIGHT = 360;

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  explainable?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  explainable = false,
}: CodeEditorProps) {
  const { fontSize, tabSize, theme } = useEditorSettings();
  const isPro = useIsPro();
  const [copied, setCopied] = useState(false);
  const [editorHeight, setEditorHeight] = useState(MIN_HEIGHT);
  const [tab, setTab] = useState<"code" | "explain">("code");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleExplain() {
    if (isExplaining) return;
    setIsExplaining(true);
    const result = await explainCode({ content: value, language: language ?? null });
    setIsExplaining(false);
    if (result.success) {
      setExplanation(result.data);
      setTab("explain");
    } else {
      toast.error(result.error ?? "Failed to generate explanation");
    }
  }

  const handleMount: OnMount = (editor) => {
    function updateHeight() {
      const h = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, editor.getContentHeight()));
      setEditorHeight(h);
      const w = containerRef.current?.getBoundingClientRect().width ?? 0;
      if (w > 0) editor.layout({ height: h, width: w });
    }
    editor.onDidContentSizeChange(updateHeight);
    updateHeight();
  };

  const monacoLang = language?.toLowerCase() || "plaintext";

  return (
    <div ref={containerRef} className="rounded-md overflow-hidden border border-border">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border-b border-white/[0.08]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        {language && (
          <span className="text-xs text-zinc-500 font-mono ml-2">{language}</span>
        )}
        {explainable && explanation && (
          <div className="flex items-center gap-0.5 ml-2">
            <button
              type="button"
              onClick={() => setTab("code")}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                tab === "code" ? "text-zinc-200 bg-white/10" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Code
            </button>
            <button
              type="button"
              onClick={() => setTab("explain")}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                tab === "explain" ? "text-zinc-200 bg-white/10" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Explain
            </button>
          </div>
        )}
        {explainable && (
          isPro ? (
            <button
              type="button"
              onClick={handleExplain}
              disabled={isExplaining}
              title={explanation ? "Regenerate explanation" : "Explain this code"}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 transition-colors ml-2 disabled:opacity-50"
            >
              {isExplaining ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {isExplaining ? "Explaining…" : "Explain"}
            </button>
          ) : (
            <span
              title="AI features require Pro subscription"
              className="flex items-center gap-1 text-xs text-zinc-600 ml-2 cursor-not-allowed"
            >
              <Crown className="h-3 w-3" />
              Explain
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
      {tab === "explain" && explanation ? (
        <div
          className="markdown-preview bg-[#1e1e1e] p-4 overflow-y-auto"
          style={{ maxHeight: MAX_HEIGHT }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
        </div>
      ) : (
        <MonacoEditor
          value={value}
          onChange={(v) => onChange?.(v ?? "")}
          language={monacoLang}
          theme={theme}
          height={editorHeight}
          onMount={handleMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            folding: false,
            wordWrap: "on",
            fontSize,
            tabSize,
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
            renderLineHighlight: readOnly ? "none" : "line",
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
              vertical: "auto",
              alwaysConsumeMouseWheel: false,
            },
          }}
        />
      )}
    </div>
  );
}
