import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body as { email?: string };

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Return 200 even if user not found to avoid user enumeration
  if (!user || !user.password) {
    return NextResponse.json({ ok: true });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
  }

  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: token,
      emailVerificationTokenExpiry: expiry,
    },
  });

  await sendVerificationEmail(email, token);

  return NextResponse.json({ ok: true });
}
