import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const emailVerificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED !== "false";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, confirmPassword } = body as {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };

  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (emailVerificationEnabled) {
    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerificationToken: token,
        emailVerificationTokenExpiry: expiry,
      },
    });

    await sendVerificationEmail(email, token);

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
