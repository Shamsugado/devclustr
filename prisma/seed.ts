import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const SYSTEM_ITEM_TYPES = [
  { id: "type_snippet", name: "Snippet", icon: "Code", color: "#3b82f6" },
  { id: "type_prompt", name: "Prompt", icon: "Sparkles", color: "#8b5cf6" },
  { id: "type_command", name: "Command", icon: "Terminal", color: "#f97316" },
  { id: "type_note", name: "Note", icon: "StickyNote", color: "#fde047" },
  { id: "type_link", name: "Link", icon: "Link", color: "#10b981" },
  { id: "type_file", name: "File", icon: "File", color: "#6b7280" },
  { id: "type_image", name: "Image", icon: "Image", color: "#ec4899" },
] as const;

async function main() {
  console.log("Seeding system item types...");

  for (const type of SYSTEM_ITEM_TYPES) {
    await prisma.itemType.upsert({
      where: { id: type.id },
      update: { name: type.name, icon: type.icon, color: type.color },
      create: { ...type, isSystem: true, userId: null },
    });
    console.log(`  ✓ ${type.name}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
