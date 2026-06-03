"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPlus, Menu, Plus, Search } from "lucide-react";

interface TopBarProps {
  onMobileMenuClick?: () => void;
}

export default function TopBar({ onMobileMenuClick }: TopBarProps) {
  return (
    <header className="flex items-center gap-4 border-b border-border px-4 md:px-6 py-3 bg-background">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuClick}
        className="md:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0 w-48">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground text-xs font-bold">
          DS
        </div>
        <span className="font-semibold text-foreground text-sm">DevClustr</span>
      </div>

      {/* Search — centred */}
      <div className="relative flex-1 max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input placeholder="Search..." className="pl-9 w-full" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 justify-end">
        <Button variant="secondary" className="bg-foreground text-background hover:bg-foreground/90">
          <FolderPlus className="h-4 w-4" />
          New Collection
        </Button>
        <Button>
          <Plus className="h-4 w-4" />
          New Item
        </Button>
      </div>
    </header>
  );
}
