"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateItem as updateItemInDb } from "@/lib/db/items";

export const UpdateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable(),
  content: z.string().nullable(),
  url: z.url("Invalid URL").nullable(),
  language: z.string().trim().nullable(),
  tags: z.array(z.string().trim().min(1)),
});

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
