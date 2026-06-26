"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { updateEditorSettings } from "@/actions/settings";
import type { EditorSettings } from "@/lib/db/users";

const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20];
const TAB_SIZES = [1, 2, 4, 8];
const THEMES = [
  { value: "vs-dark", label: "Dark" },
  { value: "vs", label: "Light" },
  { value: "hc-black", label: "High Contrast" },
] as const;

interface EditorSettingsFormProps {
  initial: EditorSettings;
}

export default function EditorSettingsForm({ initial }: EditorSettingsFormProps) {
  const [fontSize, setFontSize] = useState(initial.fontSize);
  const [tabSize, setTabSize] = useState(initial.tabSize);
  const [theme, setTheme] = useState(initial.theme);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const result = await updateEditorSettings({ fontSize, tabSize, theme });
    setIsSaving(false);
    if (result.success) {
      toast.success("Editor settings saved");
    } else {
      toast.error(result.error ?? "Failed to save settings");
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="font-size">Font size</Label>
          <select
            id="font-size"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>{s}px</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tab-size">Tab size</Label>
          <select
            id="tab-size"
            value={tabSize}
            onChange={(e) => setTabSize(Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {TAB_SIZES.map((s) => (
              <option key={s} value={s}>{s} spaces</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="theme">Theme</Label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {THEMES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isSaving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
