import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/token";

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ResetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);
  const record = await prisma.verificationToken.findUnique({ where: { token: tokenHash } });

  if (!record || !record.identifier.startsWith("reset:")) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token: tokenHash } });
    return NextResponse.json({ error: "Reset link has expired" }, { status: 400 });
  }

  const email = record.identifier.slice("reset:".length);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
    prisma.verificationToken.delete({ where: { token: tokenHash } }),
  ]);

  return NextResponse.json({ ok: true });
}
