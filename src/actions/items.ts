"use server";

import { auth } from "@/auth";
import { updateItem as updateItemInDb, deleteItem as deleteItemInDb } from "@/lib/db/items";
import { UpdateItemSchema } from "@/actions/item-schemas";

export async function deleteItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  if (!itemId) {
    return { success: false as const, error: "Invalid item ID" };
  }

  try {
    await deleteItemInDb(itemId, session.user.id);
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to delete item" };
  }
}

export async function updateItem(
  itemId: string,
  formData: {
    title: string;
    description: string | null;
    content: string | null;
    url: string | null;
    language: string | null;
    tags: string[];
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = UpdateItemSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten((e) => e.message).fieldErrors };
  }

  try {
    const item = await updateItemInDb(itemId, session.user.id, parsed.data);
    return { success: true as const, data: item };
  } catch {
    return { success: false as const, error: "Failed to update item" };
  }
}
