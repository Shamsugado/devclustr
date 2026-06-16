import { prisma } from "@/lib/prisma";

export async function getProfileUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
      createdAt: true,
    },
  });
}

export async function getItemTypeCounts(userId: string) {
  const counts = await prisma.item.groupBy({
    by: ["itemTypeId"],
    where: { userId },
    _count: { id: true },
  });

  const types = await prisma.itemType.findMany({
    where: { id: { in: counts.map((c) => c.itemTypeId) } },
    select: { id: true, name: true, icon: true, color: true },
  });

  return types.map((type) => ({
    ...type,
    count: counts.find((c) => c.itemTypeId === type.id)?._count.id ?? 0,
  }));
}
