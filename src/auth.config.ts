import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

export default {
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      // Real validation is provided in auth.ts (requires Prisma + bcrypt,
      // which are not edge-compatible).
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig;
