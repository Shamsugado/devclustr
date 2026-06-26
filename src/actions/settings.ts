"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { saveEditorSettings } from "@/lib/db/users";

const UpdateEditorSettingsSchema = z.object({
  fontSize: z.number().int().min(8).max(32),
  tabSize: z.number().int().min(1).max(8),
  theme: z.enum(["vs-dark", "vs", "hc-black"]),
});

export async function updateEditorSettings(formData: {
  fontSize: number;
  tabSize: number;
  theme: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = UpdateEditorSettingsSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid settings" };
  }

  try {
    await saveEditorSettings(session.user.id, parsed.data);
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to save settings" };
  }
}
