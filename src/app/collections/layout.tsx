import DashboardShell from "@/components/dashboard/DashboardShell";
import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";
import { getEditorSettings, EDITOR_SETTINGS_DEFAULTS } from "@/lib/db/users";

export default async function CollectionsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;

  const [itemTypes, sidebarCollections, editorSettings] = user
    ? await Promise.all([
        getSystemItemTypes(),
        getSidebarCollections(user.id),
        getEditorSettings(user.id),
      ])
    : [[], { favorites: [], recents: [] }, EDITOR_SETTINGS_DEFAULTS];

  const sidebarData = {
    itemTypes,
    favoriteCollections: sidebarCollections.favorites,
    recentCollections: sidebarCollections.recents,
    user: user
      ? { name: user.name ?? "User", email: user.email ?? "", image: user.image ?? null, isPro: user.isPro }
      : null,
  };

  return <DashboardShell sidebarData={sidebarData} editorSettings={editorSettings}>{children}</DashboardShell>;
}
