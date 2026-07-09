import { auth } from "@/auth";

export type AuthedUser = { id: string; isPro: boolean };

export async function getAuthedUser(): Promise<AuthedUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { id: session.user.id, isPro: session.user.isPro };
}
