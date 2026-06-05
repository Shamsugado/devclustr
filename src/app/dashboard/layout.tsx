import DashboardShell from "@/components/dashboard/DashboardShell";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";
import { prisma } from "@/lib/prisma";

async function getDemoUser() {
  return prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true, name: true, email: true, image: true },
  });
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getDemoUser();

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
      ? { name: user.name ?? "User", email: user.email ?? "", image: user.image }
      : null,
  };

  return <DashboardShell sidebarData={sidebarData}>{children}</DashboardShell>;
}
