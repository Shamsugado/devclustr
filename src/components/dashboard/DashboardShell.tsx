"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/dashboard/TopBar";
import Sidebar, { type SidebarData } from "@/components/dashboard/Sidebar";
import CommandPalette from "@/components/search/CommandPalette";
import { EditorSettingsProvider, type EditorSettings } from "@/contexts/EditorSettingsContext";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarData: SidebarData;
  editorSettings: EditorSettings;
}

export default function DashboardShell({ children, sidebarData, editorSettings }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <EditorSettingsProvider value={editorSettings}>
      <div className="flex flex-col h-screen bg-background">
        <TopBar
          onMobileMenuClick={() => setMobileOpen(true)}
          itemTypes={sidebarData.itemTypes}
          onSearchClick={() => setPaletteOpen(true)}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            collapsed={collapsed}
            onCollapse={() => setCollapsed((c) => !c)}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
            sidebarData={sidebarData}
          />
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </div>
    </EditorSettingsProvider>
  );
}
