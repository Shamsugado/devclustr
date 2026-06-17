import NextAuth, { CredentialsSignin } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";
import { getIp, isLoginRateLimited } from "@/lib/rate-limit";

const emailVerificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED !== "false";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  ...authConfig,
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials, request) => {
        const email = credentials.email as string | undefined;
        const password = credentials.password as string | undefined;
        if (!email || !password) return null;

        const ip = request ? getIp(request) : "127.0.0.1";
        if (await isLoginRateLimited(ip, email)) throw new RateLimitedError();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        if (emailVerificationEnabled && !user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return user;
      },
    }),
  ],
});
