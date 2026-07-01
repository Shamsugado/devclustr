"use server";

import { auth } from "@/auth";
import {
  createCollection as createCollectionInDb,
  updateCollection as updateCollectionInDb,
  deleteCollection as deleteCollectionInDb,
  toggleCollectionFavorite as toggleCollectionFavoriteInDb,
} from "@/lib/db/collections";
import { CreateCollectionSchema, UpdateCollectionSchema } from "@/actions/collection-schemas";
import { canCreateCollection } from "@/lib/tier";
import { FREE_TIER_COLLECTION_LIMIT } from "@/lib/constants";

export async function createCollection(formData: { name: string; description: string | null }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const allowed = await canCreateCollection(session.user.id, session.user.isPro);
  if (!allowed) {
    return { success: false as const, error: `Free plan is limited to ${FREE_TIER_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.` };
  }

  const parsed = CreateCollectionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten((e) => e.message).fieldErrors };
  }

  try {
    const collection = await createCollectionInDb(session.user.id, parsed.data);
    return { success: true as const, data: collection };
  } catch {
    return { success: false as const, error: "Failed to create collection" };
  }
}

export async function updateCollection(formData: {
  id: string;
  name: string;
  description: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = UpdateCollectionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten((e) => e.message).fieldErrors };
  }

  try {
    const collection = await updateCollectionInDb(session.user.id, parsed.data.id, parsed.data);
    return { success: true as const, data: collection };
  } catch {
    return { success: false as const, error: "Failed to update collection" };
  }
}

export async function toggleCollectionFavorite(collectionId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };
  if (!collectionId) return { success: false as const, error: "Invalid ID" };
  try {
    const { isFavorite } = await toggleCollectionFavoriteInDb(collectionId, session.user.id);
    return { success: true as const, isFavorite };
  } catch {
    return { success: false as const, error: "Failed to update favorite" };
  }
}

export async function deleteCollection(formData: { id: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  if (!formData.id) {
    return { success: false as const, error: "Invalid ID" };
  }

  try {
    await deleteCollectionInDb(session.user.id, formData.id);
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to delete collection" };
  }
}
