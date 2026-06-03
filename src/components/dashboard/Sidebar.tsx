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
  User,
} from "lucide-react";
import { mockUser, mockItemTypes, mockCollections, mockItems } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: Link2,
  File,
  Image: ImageIcon,
};

function getRecentCollections() {
  const seenIds = new Set<string>();
  const ordered: string[] = [];

  [...mockItems]
    .sort((a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime())
    .forEach((item) => {
      item.collectionIds.forEach((id) => {
        if (!seenIds.has(id)) {
          seenIds.add(id);
          ordered.push(id);
        }
      });
    });

  return ordered
    .map((id) => mockCollections.find((c) => c.id === id))
    .filter((c): c is (typeof mockCollections)[0] => Boolean(c));
}

function getTypeColor(typeId: string) {
  return mockItemTypes.find((t) => t.id === typeId)?.color ?? "#6b7280";
}

function getUserInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface SidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarContent() {
  const favoriteCollections = mockCollections.filter((c) => c.isFavorite);
  const allRecent = getRecentCollections();
  const recentCollections = allRecent.filter((c) => !c.isFavorite).slice(0, 3);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {/* Quick Access */}
        <section>
          <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
          <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Item Types
          </p>
          <ul className="space-y-0.5">
            {mockItemTypes.map((type) => {
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
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Collections
            </p>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {favoriteCollections.length > 0 && (
            <>
              <p className="px-2 mb-0.5 text-[10px] text-muted-foreground/60">Favorites</p>
              <ul className="space-y-0.5 mb-2">
                {favoriteCollections.map((col) => (
                  <CollectionItem key={col.id} collection={col} />
                ))}
              </ul>
            </>
          )}

          {recentCollections.length > 0 && (
            <>
              <p className="px-2 mb-0.5 text-[10px] text-muted-foreground/60">Recent</p>
              <ul className="space-y-0.5">
                {recentCollections.map((col) => (
                  <CollectionItem key={col.id} collection={col} />
                ))}
              </ul>
            </>
          )}
        </section>
      </nav>

      {/* User area */}
      <div className="shrink-0 border-t border-border px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
            {mockUser.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mockUser.image} alt={mockUser.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              getUserInitials(mockUser.name)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{mockUser.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{mockUser.email}</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
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
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        {icon}
        <span>{label}</span>
      </Link>
    </li>
  );
}

function CollectionItem({ collection }: { collection: (typeof mockCollections)[0] }) {
  const color = getTypeColor(collection.dominantTypeId);
  return (
    <li>
      <Link
        href={`/collections/${collection.id}`}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="flex-1 truncate">{collection.name}</span>
        <span className="text-[10px] text-muted-foreground/60 shrink-0">{collection.itemCount}</span>
      </Link>
    </li>
  );
}

export default function Sidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }: SidebarProps) {
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
        {!collapsed && <SidebarContent />}
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
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
