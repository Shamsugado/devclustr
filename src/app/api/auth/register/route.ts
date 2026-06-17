import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";

const emailVerificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED !== "false";

const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  password: z.string().min(8).max(72),
  confirmPassword: z.string(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, email, password, confirmPassword } = parsed.data;

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  if (emailVerificationEnabled) {
    const { raw, hashed } = generateToken();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerificationToken: hashed,
        emailVerificationTokenExpiry: expiry,
      },
    });

    await sendVerificationEmail(email, raw);

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email, requiresVerification: true },
      { status: 201 }
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  return NextResponse.json(
    { id: user.id, name: user.name, email: user.email, requiresVerification: false },
    { status: 201 }
  );
}
