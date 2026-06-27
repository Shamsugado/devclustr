"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderOpen, FolderPlus, Menu, Plus, Search, Star } from "lucide-react";
import NewItemDialog from "@/components/items/NewItemDialog";
import NewCollectionDialog from "@/components/collections/NewCollectionDialog";
import type { SidebarItemType } from "@/components/dashboard/Sidebar";

interface TopBarProps {
  onMobileMenuClick?: () => void;
  onSearchClick?: () => void;
  itemTypes?: SidebarItemType[];
}

export default function TopBar({ onMobileMenuClick, onSearchClick, itemTypes = [] }: TopBarProps) {
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);

  return (
    <>
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
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 md:w-60">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white">
            <FolderOpen className="h-4 w-4" />
          </div>
          <span className="font-semibold text-foreground text-base">DevClustr</span>
        </Link>

        {/* Search trigger — centred */}
        <button
          onClick={onSearchClick}
          className="relative flex-1 max-w-md mx-auto flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            <span className="text-base leading-none">⌘</span>K
          </kbd>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 justify-end">
          <Link
            href="/favorites"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Favorites"
          >
            <Star className="h-5 w-5" />
          </Link>
          <Button
            variant="secondary"
            className="bg-foreground text-background hover:bg-foreground/90"
            onClick={() => setNewCollectionOpen(true)}
            aria-label="New Collection"
          >
            <FolderPlus className="h-4 w-4" />
            <span className="hidden sm:inline">New Collection</span>
          </Button>
          <Button onClick={() => setNewItemOpen(true)} aria-label="New Item">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Item</span>
          </Button>
        </div>
      </header>

      <NewItemDialog open={newItemOpen} onOpenChange={setNewItemOpen} itemTypes={itemTypes} />
      <NewCollectionDialog open={newCollectionOpen} onOpenChange={setNewCollectionOpen} />
    </>
  );
}
