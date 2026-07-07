"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateAutoSummary } from "@/actions/ai";

interface SummarySuggestButtonProps {
  title: string;
  content: string;
  url: string;
  language: string;
  fileName: string;
  onGenerate: (summary: string) => void;
}

export default function SummarySuggestButton({
  title,
  content,
  url,
  language,
  fileName,
  onGenerate,
}: SummarySuggestButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await generateAutoSummary({
      title,
      content: content || null,
      url: url.trim() || null,
      language: language.trim() || null,
      fileName: fileName.trim() || null,
    });
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to generate summary");
      return;
    }

    onGenerate(result.data);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title="Generate description with AI"
      aria-label="Generate description with AI"
      className="inline-flex items-center justify-center h-5 w-5 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
    >
      <Sparkles className={`h-3.5 w-3.5 ${loading ? "animate-pulse" : ""}`} />
    </button>
  );
}
