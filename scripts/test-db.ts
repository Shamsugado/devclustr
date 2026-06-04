import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== Database Verification ===\n");

  // ── System item types ─────────────────────────────────────────────────────
  const itemTypes = await prisma.itemType.findMany({ orderBy: { name: "asc" } });
  console.log(`Item types (${itemTypes.length}):`);
  for (const t of itemTypes) {
    console.log(`  [${t.isSystem ? "system" : "user  "}]  ${t.icon.padEnd(12)} ${t.name.padEnd(10)} ${t.color}`);
  }

  // ── Demo user ─────────────────────────────────────────────────────────────
  console.log("\nDemo user:");
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: {
      id: true,
      name: true,
      email: true,
      isPro: true,
      emailVerified: true,
      password: true,
    },
  });

  if (!user) {
    console.log("  ✗ demo@devstash.io not found");
  } else {
    console.log(`  name:          ${user.name}`);
    console.log(`  email:         ${user.email}`);
    console.log(`  isPro:         ${user.isPro}`);
    console.log(`  emailVerified: ${user.emailVerified?.toISOString()}`);
    console.log(`  password hash: ${user.password ? user.password.slice(0, 29) + "…" : "MISSING"}`);
  }

  // ── Collections with item counts ──────────────────────────────────────────
  console.log("\nCollections:");
  const collections = await prisma.collection.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { items: true } },
      defaultType: { select: { name: true } },
    },
  });

  for (const col of collections) {
    const fav = col.isFavorite ? " ★" : "";
    const type = col.defaultType ? ` [default: ${col.defaultType.name}]` : "";
    console.log(`  ${col.name.padEnd(22)} ${col._count.items} items${fav}${type}`);
  }

  // ── Items grouped by type ─────────────────────────────────────────────────
  console.log("\nItems by type:");
  const items = await prisma.item.findMany({
    orderBy: [{ itemTypeId: "asc" }, { title: "asc" }],
    include: { itemType: { select: { name: true } } },
  });

  const byType = items.reduce<Record<string, typeof items>>(
    (acc, item) => {
      const key = item.itemType.name;
      (acc[key] ??= []).push(item);
      return acc;
    },
    {}
  );

  for (const [type, group] of Object.entries(byType)) {
    console.log(`  ${type} (${group.length}):`);
    for (const item of group) {
      const flags = [item.isFavorite && "fav", item.isPinned && "pinned"]
        .filter(Boolean)
        .join(", ");
      console.log(`    - ${item.title}${flags ? ` [${flags}]` : ""}`);
    }
  }

  // ── Totals ────────────────────────────────────────────────────────────────
  const [userCount, itemCount, collectionCount] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.collection.count(),
  ]);

  console.log("\nTotals:");
  console.log(`  users:       ${userCount}`);
  console.log(`  items:       ${itemCount}`);
  console.log(`  collections: ${collectionCount}`);
  console.log("\nDatabase OK ✓");
}

main()
  .catch((e) => {
    console.error("FAILED:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
