"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { OnMount } from "@monaco-editor/react";
import { Copy, Check } from "lucide-react";
import { useEditorSettings } from "@/contexts/EditorSettingsContext";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const MIN_HEIGHT = 80;
const MAX_HEIGHT = 360;

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

export default function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const { fontSize, tabSize, theme } = useEditorSettings();
  const [copied, setCopied] = useState(false);
  const [editorHeight, setEditorHeight] = useState(MIN_HEIGHT);
  const containerRef = useRef<HTMLDivElement>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 transition-colors ml-auto"
        >
          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
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
    </div>
  );
}
