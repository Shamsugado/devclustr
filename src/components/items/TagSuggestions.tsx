"use client";

import { useState } from "react";
import { Sparkles, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateAutoTags } from "@/actions/ai";

interface TagSuggestionsProps {
  title: string;
  description: string;
  content: string;
  existingTags: string[];
  onAccept: (tag: string) => void;
}

export default function TagSuggestions({
  title,
  description,
  content,
  existingTags,
  onAccept,
}: TagSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSuggest() {
    setLoading(true);
    const result = await generateAutoTags({
      title,
      description: description.trim() || null,
      content: content || null,
    });
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to suggest tags");
      return;
    }

    const fresh = result.data.filter((tag) => !existingTags.includes(tag));
    setSuggestions(fresh);
    if (fresh.length === 0) {
      toast.info("No new tag suggestions");
    }
  }

  function handleAccept(tag: string) {
    onAccept(tag);
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  function handleReject(tag: string) {
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleSuggest}
        disabled={loading}
        className="self-start h-7 px-2 text-xs text-muted-foreground"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {loading ? "Suggesting…" : "Suggest Tags"}
      </Button>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs text-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleAccept(tag)}
                aria-label={`Accept tag ${tag}`}
                className="text-green-600 hover:text-green-500 dark:text-green-500 dark:hover:text-green-400"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => handleReject(tag)}
                aria-label={`Reject tag ${tag}`}
                className="text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
