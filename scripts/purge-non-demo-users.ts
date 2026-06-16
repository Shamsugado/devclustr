import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@devstash.io";

async function main() {
  const demo = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!demo) {
    console.error(`Demo user ${DEMO_EMAIL} not found — aborting.`);
    process.exit(1);
  }

  const targets = await prisma.user.findMany({
    where: { id: { not: demo.id } },
    select: { id: true, email: true },
  });

  if (targets.length === 0) {
    console.log("No non-demo users found. Nothing to delete.");
    return;
  }

  console.log(`Found ${targets.length} user(s) to delete:`);
  for (const u of targets) {
    console.log(`  - ${u.email ?? u.id}`);
  }

  const ids = targets.map((u) => u.id);

  // Cascade deletes handle items, collections, accounts, sessions, etc.
  // (all relations use onDelete: Cascade in the schema)
  const { count } = await prisma.user.deleteMany({
    where: { id: { in: ids } },
  });

  console.log(`\nDeleted ${count} user(s) and all their associated data.`);
  console.log(`Demo user (${DEMO_EMAIL}) untouched.`);
}

main()
  .catch((e) => {
    console.error("FAILED:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
