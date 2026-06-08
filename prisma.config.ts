import "dotenv/config";
import { defineConfig } from "prisma/config";
import { env } from "process";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Direct (non-pooled) connection required for migrations
    url: process.env.DIRECT_URL ?? env.DATABASE_URL,
  },
});
