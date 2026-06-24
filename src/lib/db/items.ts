import { cache } from "react";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats(userId: string) {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);
  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}

export async function getPinnedItems(userId: string) {
  return prisma.item.findMany({
    where: { userId, isPinned: true },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getRecentItems(userId: string, limit = 10) {
  return prisma.item.findMany({
    where: { userId },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
    orderBy: { lastUsedAt: "desc" },
    take: limit,
  });
}

export const getSystemItemTypes = cache(async () => {
  return prisma.itemType.findMany({
    where: { isSystem: true },
    select: { id: true, name: true, icon: true, color: true },
  });
});

export async function getItemsByTypeSlug(userId: string, typeSlug: string) {
  const typeName = typeSlug.slice(0, -1); // "snippets" → "snippet"
  return prisma.item.findMany({
    where: {
      userId,
      itemType: { name: { equals: typeName, mode: "insensitive" } },
    },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export type ItemWithType = Awaited<ReturnType<typeof getItemsByTypeSlug>>[0];

export async function getItemById(id: string, userId: string) {
  return prisma.item.findFirst({
    where: { id, userId },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
      collections: { include: { collection: { select: { id: true, name: true } } } },
    },
  });
}

export type ItemDetail = Awaited<ReturnType<typeof getItemById>>;

export async function deleteItem(id: string, userId: string) {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    select: { contentType: true, fileUrl: true },
  });
  await prisma.item.delete({ where: { id, userId } });
  return item;
}

export async function createItem(
  userId: string,
  data: {
    typeId: string;
    title: string;
    description: string | null;
    content: string | null;
    url: string | null;
    language: string | null;
    tags: string[];
    collectionIds: string[];
    contentType: "TEXT" | "URL" | "FILE";
    fileKey: string | null;
    fileName: string | null;
    fileSize: number | null;
  }
) {
  const ownedCollectionIds = data.collectionIds.length > 0
    ? (await prisma.collection.findMany({
        where: { id: { in: data.collectionIds }, userId },
        select: { id: true },
      })).map((c) => c.id)
    : [];

  return prisma.item.create({
    data: {
      userId,
      itemTypeId: data.typeId,
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      contentType: data.contentType,
      fileUrl: data.fileKey,
      fileName: data.fileName,
      fileSize: data.fileSize,
      tags: {
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
      collections: {
        create: ownedCollectionIds.map((collectionId) => ({ collectionId })),
      },
    },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
      collections: { include: { collection: { select: { id: true, name: true } } } },
    },
  });
}

export async function updateItem(
  id: string,
  userId: string,
  data: {
    title: string;
    description: string | null;
    content: string | null;
    url: string | null;
    language: string | null;
    tags: string[];
    collectionIds: string[];
  }
) {
  const ownedCollectionIds = data.collectionIds.length > 0
    ? (await prisma.collection.findMany({
        where: { id: { in: data.collectionIds }, userId },
        select: { id: true },
      })).map((c) => c.id)
    : [];

  return prisma.item.update({
    where: { id, userId },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        deleteMany: {},
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
      collections: {
        deleteMany: {},
        create: ownedCollectionIds.map((collectionId) => ({ collectionId })),
      },
    },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
      collections: { include: { collection: { select: { id: true, name: true } } } },
    },
  });
}
