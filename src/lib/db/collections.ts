import { prisma } from "@/lib/prisma";

export type UserCollection = { id: string; name: string };

export async function getUserCollections(userId: string): Promise<UserCollection[]> {
  return prisma.collection.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

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

export async function getAllCollections(userId: string): Promise<CollectionMeta[]> {
  const collections = await fetchCollectionsWithMeta(userId);
  return collections.sort((a, b) => a.name.localeCompare(b.name));
}

export type CollectionWithDetail = CollectionMeta & { description: string | null };

export async function getCollectionById(
  userId: string,
  collectionId: string
): Promise<CollectionWithDetail | null> {
  const all = await fetchCollectionsWithMeta(userId);
  const found = all.find((c) => c.id === collectionId);
  return found ?? null;
}

export async function updateCollection(
  userId: string,
  collectionId: string,
  data: { name: string; description: string | null }
): Promise<{ id: string; name: string; description: string | null }> {
  const existing = await prisma.collection.findFirst({ where: { id: collectionId, userId } });
  if (!existing) throw new Error("Not found");

  return prisma.collection.update({
    where: { id: collectionId },
    data: { name: data.name, description: data.description },
    select: { id: true, name: true, description: true },
  });
}

export async function deleteCollection(userId: string, collectionId: string): Promise<void> {
  const existing = await prisma.collection.findFirst({ where: { id: collectionId, userId } });
  if (!existing) throw new Error("Not found");

  await prisma.collection.delete({ where: { id: collectionId } });
}
