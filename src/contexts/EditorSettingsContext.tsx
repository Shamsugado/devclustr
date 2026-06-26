"use client";

import { createContext, useContext } from "react";
import type { EditorSettings } from "@/lib/db/users";

export { type EditorSettings };

const EditorSettingsContext = createContext<EditorSettings>({
  fontSize: 12,
  tabSize: 2,
  theme: "vs-dark",
});

export function EditorSettingsProvider({
  value,
  children,
}: {
  value: EditorSettings;
  children: React.ReactNode;
}) {
  return (
    <EditorSettingsContext.Provider value={value}>
      {children}
    </EditorSettingsContext.Provider>
  );
}

export function useEditorSettings(): EditorSettings {
  return useContext(EditorSettingsContext);
}
