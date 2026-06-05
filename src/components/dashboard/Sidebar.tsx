"use client";

import Link from "next/link";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link2,
  File,
  Image as ImageIcon,
  Star,
  Clock,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  X,
} from "lucide-react";
import type { CollectionMeta } from "@/lib/db/collections";

const iconMap: Record<string, React.ElementType> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: Link2,
  File,
  Image: ImageIcon,
};

export type SidebarItemType = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type SidebarData = {
  itemTypes: SidebarItemType[];
  favoriteCollections: CollectionMeta[];
  recentCollections: CollectionMeta[];
  user: { name: string; email: string; image: string | null } | null;
};

interface SidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  sidebarData: SidebarData;
}

function getUserInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function SidebarContent({ data }: { data: SidebarData }) {
  const { itemTypes, favoriteCollections, recentCollections, user } = data;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {/* Quick Access */}
        <section>
          <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Quick Access
          </p>
          <ul className="space-y-0.5">
            <NavItem href="/dashboard" icon={<LayoutGrid className="h-4 w-4" />} label="All Items" />
            <NavItem href="/dashboard/favorites" icon={<Star className="h-4 w-4" />} label="Favorites" />
            <NavItem href="/dashboard/recent" icon={<Clock className="h-4 w-4" />} label="Recent" />
          </ul>
        </section>

        {/* Item Types */}
        <section>
          <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Item Types
          </p>
          <ul className="space-y-0.5">
            {itemTypes.map((type) => {
              const Icon = iconMap[type.icon] ?? File;
              const slug = type.name.toLowerCase() + "s";
              return (
                <NavItem
                  key={type.id}
                  href={`/items/${slug}`}
                  icon={<Icon className="h-4 w-4" style={{ color: type.color }} />}
                  label={type.name + "s"}
                />
              );
            })}
          </ul>
        </section>

        {/* Collections */}
        <section>
          <div className="flex items-center justify-between px-2 mb-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Collections
            </p>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {favoriteCollections.length > 0 && (
            <>
              <p className="px-2 mb-0.5 text-xs text-muted-foreground/60">Favorites</p>
              <ul className="space-y-0.5 mb-2">
                {favoriteCollections.map((col) => (
                  <CollectionItem key={col.id} collection={col} showStar />
                ))}
              </ul>
            </>
          )}

          {recentCollections.length > 0 && (
            <>
              <p className="px-2 mb-0.5 text-xs text-muted-foreground/60">Recent</p>
              <ul className="space-y-0.5">
                {recentCollections.map((col) => (
                  <CollectionItem key={col.id} collection={col} showStar={false} />
                ))}
              </ul>
            </>
          )}

          <Link
            href="/collections"
            className="flex items-center gap-2 px-2 mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all collections
          </Link>
        </section>
      </nav>

      {/* User area */}
      {user && (
        <div className="shrink-0 border-t border-border px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                getUserInitials(user.name)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-base text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        {icon}
        <span>{label}</span>
      </Link>
    </li>
  );
}

function CollectionItem({
  collection,
  showStar,
}: {
  collection: CollectionMeta;
  showStar: boolean;
}) {
  return (
    <li>
      <Link
        href={`/collections/${collection.id}`}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-base text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        {showStar ? (
          <Star className="h-2.5 w-2.5 shrink-0 fill-yellow-400 text-yellow-400" />
        ) : (
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: collection.dominantTypeColor }}
          />
        )}
        <span className="flex-1 truncate">{collection.name}</span>
        <span className="text-xs text-muted-foreground/60 shrink-0">{collection.itemCount}</span>
      </Link>
    </li>
  );
}

export default function Sidebar({
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
  sidebarData,
}: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-background transition-[width] duration-200 overflow-hidden shrink-0 ${
          collapsed ? "w-10" : "w-60"
        }`}
      >
        <div className="flex justify-end p-1.5 shrink-0">
          <button
            onClick={onCollapse}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
        {!collapsed && <SidebarContent data={sidebarData} />}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-60 bg-background border-r border-border flex flex-col">
            <div className="flex justify-end p-1.5 shrink-0">
              <button
                onClick={onMobileClose}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent data={sidebarData} />
          </aside>
        </div>
      )}
    </>
  );
}
