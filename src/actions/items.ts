"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import {
  createItem as createItemInDb,
  updateItem as updateItemInDb,
  deleteItem as deleteItemInDb,
  toggleItemFavorite as toggleItemFavoriteInDb,
} from "@/lib/db/items";
import { r2, R2_BUCKET } from "@/lib/r2";
import { CreateItemSchema, UpdateItemSchema } from "@/actions/item-schemas";

export async function createItem(formData: {
  typeId: string;
  typeName: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  collectionIds: string[];
  fileKey: string | null;
  fileName: string | null;
  fileSize: number | null;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = CreateItemSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten((e) => e.message).fieldErrors };
  }

  const typeName = formData.typeName.toLowerCase();
  const isLink = typeName === "link";
  const isFileType = typeName === "file" || typeName === "image";

  if (isLink && !parsed.data.url) {
    return { success: false as const, error: "URL is required for links" };
  }
  if (isFileType && !parsed.data.fileKey) {
    return { success: false as const, error: "A file is required" };
  }

  const contentType = isLink ? "URL" : isFileType ? "FILE" : "TEXT";

  try {
    const item = await createItemInDb(session.user.id, { ...parsed.data, contentType, collectionIds: parsed.data.collectionIds });
    return { success: true as const, data: item };
  } catch {
    return { success: false as const, error: "Failed to create item" };
  }
}

export async function deleteItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  if (!itemId) {
    return { success: false as const, error: "Invalid item ID" };
  }

  try {
    const deleted = await deleteItemInDb(itemId, session.user.id);
    if (deleted?.contentType === "FILE" && deleted.fileUrl) {
      await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: deleted.fileUrl }));
    }
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to delete item" };
  }
}

export async function toggleItemFavorite(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };
  if (!itemId) return { success: false as const, error: "Invalid item ID" };
  try {
    const { isFavorite } = await toggleItemFavoriteInDb(itemId, session.user.id);
    return { success: true as const, isFavorite };
  } catch {
    return { success: false as const, error: "Failed to update favorite" };
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
    collectionIds: string[];
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
