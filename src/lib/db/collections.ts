import { prisma } from "@/lib/prisma";

export type CollectionCreated = {
  id: string;
  name: string;
  description: string | null;
};

export async function createCollection(
  userId: string,
  data: { name: string; description: string | null }
): Promise<CollectionCreated> {
  return prisma.collection.create({
    data: { userId, name: data.name, description: data.description },
    select: { id: true, name: true, description: true },
  });
}

export type CollectionMeta = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  itemTypes: { typeId: string; icon: string; color: string }[];
  dominantTypeColor: string;
  latestItemUsedAt: number;
};

async function fetchCollectionsWithMeta(userId: string): Promise<CollectionMeta[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          item: {
            select: {
              itemTypeId: true,
              lastUsedAt: true,
              itemType: { select: { icon: true, color: true } },
            },
          },
        },
      },
      _count: { select: { items: true } },
    },
  });

  return collections.map((col) => {
    const typeMap = new Map<string, { typeId: string; icon: string; color: string }>();
    const typeCounts = new Map<string, number>();

    for (const ic of col.items) {
      const typeId = ic.item.itemTypeId;
      typeMap.set(typeId, { typeId, icon: ic.item.itemType.icon, color: ic.item.itemType.color });
      typeCounts.set(typeId, (typeCounts.get(typeId) ?? 0) + 1);
    }

    let dominantTypeColor = "#6b7280";
    if (typeCounts.size > 0) {
      const dominantTypeId = [...typeCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
      dominantTypeColor = typeMap.get(dominantTypeId)?.color ?? "#6b7280";
    }

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col._count.items,
      itemTypes: [...typeMap.values()],
      dominantTypeColor,
      latestItemUsedAt: col.items
        .map((ic) => ic.item.lastUsedAt?.getTime() ?? 0)
        .reduce((max, t) => Math.max(max, t), 0),
    };
  });
}

export async function getRecentCollections(userId: string, limit = 6): Promise<CollectionMeta[]> {
  const collections = await fetchCollectionsWithMeta(userId);
  return collections
    .sort((a, b) => b.latestItemUsedAt - a.latestItemUsedAt)
    .slice(0, limit);
}

export async function getSidebarCollections(
  userId: string
): Promise<{ favorites: CollectionMeta[]; recents: CollectionMeta[] }> {
  const collections = await fetchCollectionsWithMeta(userId);
  const sorted = [...collections].sort((a, b) => b.latestItemUsedAt - a.latestItemUsedAt);
  return {
    favorites: sorted.filter((c) => c.isFavorite),
    recents: sorted.filter((c) => !c.isFavorite).slice(0, 3),
  };
}
