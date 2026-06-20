"use client";

import { useState } from "react";
import TopBar from "@/components/dashboard/TopBar";
import Sidebar, { type SidebarData } from "@/components/dashboard/Sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarData: SidebarData;
}

export default function DashboardShell({ children, sidebarData }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar onMobileMenuClick={() => setMobileOpen(true)} itemTypes={sidebarData.itemTypes} />
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
    </div>
  );
}
