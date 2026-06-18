import DashboardShell from "@/components/dashboard/DashboardShell";
import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";

export default async function ItemsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;

  const [itemTypes, sidebarCollections] = user
    ? await Promise.all([
        getSystemItemTypes(),
        getSidebarCollections(user.id),
      ])
    : [[], { favorites: [], recents: [] }];

  const sidebarData = {
    itemTypes,
    favoriteCollections: sidebarCollections.favorites,
    recentCollections: sidebarCollections.recents,
    user: user
      ? { name: user.name ?? "User", email: user.email ?? "", image: user.image ?? null }
      : null,
  };

  return <DashboardShell sidebarData={sidebarData}>{children}</DashboardShell>;
}
