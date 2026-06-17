import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/token";
import { sendPasswordResetEmail } from "@/lib/email";

const ForgotPasswordSchema = z.object({
  email: z.string().email().max(254),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ForgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Return 200 silently whether email exists or not to avoid user enumeration.
  // Also skip users with no password (GitHub OAuth — they can't use password reset).
  if (!user || !user.password) {
    return NextResponse.json({ ok: true });
  }

  const identifier = `reset:${email}`;
  const { raw, hashed } = generateToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing reset token for this user before creating a new one
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  // Store the hash in the DB; only the raw token goes in the email URL
  await prisma.verificationToken.create({
    data: { identifier, token: hashed, expires },
  });

  await sendPasswordResetEmail(email, raw);

  return NextResponse.json({ ok: true });
}
