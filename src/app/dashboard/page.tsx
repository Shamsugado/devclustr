import DashboardMain from "@/components/dashboard/DashboardMain";
import { getRecentCollections } from "@/lib/db/collections";
import { getDashboardStats, getPinnedItems, getRecentItems } from "@/lib/db/items";
import { prisma } from "@/lib/prisma";

async function getDemoUserId() {
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  });
  return user?.id ?? null;
}

export default async function DashboardPage() {
  const userId = await getDemoUserId();

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No user found.
      </div>
    );
  }

  const [stats, pinnedItems, recentItems, recentCollections] = await Promise.all([
    getDashboardStats(userId),
    getPinnedItems(userId),
    getRecentItems(userId, 10),
    getRecentCollections(userId, 6),
  ]);

  return (
    <DashboardMain
      stats={stats}
      pinnedItems={pinnedItems}
      recentItems={recentItems}
      recentCollections={recentCollections}
    />
  );
}
