import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // Verify connection and seeded item types
  const itemTypes = await prisma.itemType.findMany({
    orderBy: { name: "asc" },
  });

  console.log(`Found ${itemTypes.length} system item types:`);
  for (const type of itemTypes) {
    console.log(`  ${type.icon.padEnd(12)} ${type.name.padEnd(10)} ${type.color}`);
  }

  // Quick counts across all tables
  const [users, items, collections, tags] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.tag.count(),
  ]);

  console.log("\nTable counts:");
  console.log(`  users:       ${users}`);
  console.log(`  items:       ${items}`);
  console.log(`  collections: ${collections}`);
  console.log(`  tags:        ${tags}`);

  console.log("\nDatabase connection OK ✓");
}

main()
  .catch((e) => {
    console.error("Database connection FAILED:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
