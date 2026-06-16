import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body as { email?: string };

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Return 200 silently whether email exists or not to avoid user enumeration.
  // Also skip users with no password (GitHub OAuth — they can't use password reset).
  if (!user || !user.password) {
    return NextResponse.json({ ok: true });
  }

  const identifier = `reset:${email}`;
  const token = randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing reset token for this user before creating a new one
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  await sendPasswordResetEmail(email, token);

  return NextResponse.json({ ok: true });
}
