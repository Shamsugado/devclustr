"use server";

import { getAuthedUser } from "@/lib/auth-helpers";
import { toggleAction } from "@/lib/toggle-action";
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
  const user = await getAuthedUser();
  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const allowed = await canCreateCollection(user.id, user.isPro);
  if (!allowed) {
    return { success: false as const, error: `Free plan is limited to ${FREE_TIER_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.` };
  }

  const parsed = CreateCollectionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten((e) => e.message).fieldErrors };
  }

  try {
    const collection = await createCollectionInDb(user.id, parsed.data);
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
  const user = await getAuthedUser();
  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = UpdateCollectionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten((e) => e.message).fieldErrors };
  }

  try {
    const collection = await updateCollectionInDb(user.id, parsed.data.id, parsed.data);
    return { success: true as const, data: collection };
  } catch {
    return { success: false as const, error: "Failed to update collection" };
  }
}

export async function toggleCollectionFavorite(collectionId: string) {
  return toggleAction(collectionId, "Invalid ID", toggleCollectionFavoriteInDb, "isFavorite", "Failed to update favorite");
}

export async function deleteCollection(formData: { id: string }) {
  const user = await getAuthedUser();
  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  if (!formData.id) {
    return { success: false as const, error: "Invalid ID" };
  }

  try {
    await deleteCollectionInDb(user.id, formData.id);
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to delete collection" };
  }
}
