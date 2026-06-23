"use server";

import { auth } from "@/auth";
import { createCollection as createCollectionInDb } from "@/lib/db/collections";
import { CreateCollectionSchema } from "@/actions/collection-schemas";

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
