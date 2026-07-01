import { prisma } from "@/lib/prisma";

export const EDITOR_SETTINGS_DEFAULTS = {
  fontSize: 12,
  tabSize: 2,
  theme: "vs-dark",
} as const;

export type EditorSettings = {
  fontSize: number;
  tabSize: number;
  theme: string;
};

export async function getEditorSettings(userId: string): Promise<EditorSettings> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { editorFontSize: true, editorTabSize: true, editorTheme: true },
  });
  return {
    fontSize: user?.editorFontSize ?? EDITOR_SETTINGS_DEFAULTS.fontSize,
    tabSize: user?.editorTabSize ?? EDITOR_SETTINGS_DEFAULTS.tabSize,
    theme: user?.editorTheme ?? EDITOR_SETTINGS_DEFAULTS.theme,
  };
}

export async function saveEditorSettings(userId: string, settings: EditorSettings): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      editorFontSize: settings.fontSize,
      editorTabSize: settings.tabSize,
      editorTheme: settings.theme,
    },
  });
}

export async function getProfileUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
      isPro: true,
      createdAt: true,
    },
  });
}

export async function getItemTypeCounts(userId: string) {
  const counts = await prisma.item.groupBy({
    by: ["itemTypeId"],
    where: { userId },
    _count: { id: true },
  });

  const types = await prisma.itemType.findMany({
    where: { id: { in: counts.map((c) => c.itemTypeId) } },
    select: { id: true, name: true, icon: true, color: true },
  });

  return types.map((type) => ({
    ...type,
    count: counts.find((c) => c.itemTypeId === type.id)?._count.id ?? 0,
  }));
}
