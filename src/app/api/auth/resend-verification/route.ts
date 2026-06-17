import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";
import { checkResendVerificationRateLimit } from "@/lib/rate-limit";

const ResendVerificationSchema = z.object({
  email: z.string().email().max(254),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ResendVerificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email } = parsed.data;

  const rateLimitRes = await checkResendVerificationRateLimit(request, email);
  if (rateLimitRes) return rateLimitRes;
  const user = await prisma.user.findUnique({ where: { email } });

  // Return 200 even if user not found to avoid user enumeration
  if (!user || !user.password) {
    return NextResponse.json({ ok: true });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
  }

  const { raw, hashed } = generateToken();
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: hashed,
      emailVerificationTokenExpiry: expiry,
    },
  });

  await sendVerificationEmail(email, raw);

  return NextResponse.json({ ok: true });
}
