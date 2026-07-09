import { getAuthedUser } from "@/lib/auth-helpers";

type ToggleResult<K extends string> = ({ success: true } & Record<K, boolean>) | { success: false; error: string };

export async function toggleAction<K extends string>(
  id: string,
  invalidIdError: string,
  toggleFn: (id: string, userId: string) => Promise<Record<K, boolean>>,
  key: K,
  failError: string
): Promise<ToggleResult<K>> {
  const user = await getAuthedUser();
  if (!user) return { success: false, error: "Unauthorized" };
  if (!id) return { success: false, error: invalidIdError };

  try {
    const result = await toggleFn(id, user.id);
    return { success: true, [key]: result[key] } as ToggleResult<K>;
  } catch {
    return { success: false, error: failError };
  }
}
