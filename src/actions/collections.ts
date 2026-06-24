"use server";

import { auth } from "@/auth";
import {
  createCollection as createCollectionInDb,
  updateCollection as updateCollectionInDb,
  deleteCollection as deleteCollectionInDb,
} from "@/lib/db/collections";
import { CreateCollectionSchema, UpdateCollectionSchema } from "@/actions/collection-schemas";

export async function createCollection(formData: { name: string; description: string | null }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
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
