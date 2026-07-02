import { prisma } from "@/lib/prisma";
import {
  FREE_TIER_ITEM_LIMIT,
  FREE_TIER_COLLECTION_LIMIT,
  PRO_ONLY_ITEM_TYPE_SLUGS,
} from "@/lib/constants";

export async function canCreateItem(userId: string, isPro: boolean): Promise<boolean> {
  if (isPro) return true;
  const count = await prisma.item.count({ where: { userId } });
  return count < FREE_TIER_ITEM_LIMIT;
}

export async function canCreateCollection(userId: string, isPro: boolean): Promise<boolean> {
  if (isPro) return true;
  const count = await prisma.collection.count({ where: { userId } });
  return count < FREE_TIER_COLLECTION_LIMIT;
}

export function canAccessItemTypeSlug(typeSlug: string, isPro: boolean): boolean {
  if (isPro) return true;
  return !PRO_ONLY_ITEM_TYPE_SLUGS.includes(
    typeSlug as (typeof PRO_ONLY_ITEM_TYPE_SLUGS)[number],
  );
}
