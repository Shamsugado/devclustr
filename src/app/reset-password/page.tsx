import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/token";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <InvalidLink reason="missing" />;
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token: hashToken(token) },
  });

  if (!record || !record.identifier.startsWith("reset:")) {
    return <InvalidLink reason="invalid" />;
  }

  if (record.expires < new Date()) {
    return <InvalidLink reason="expired" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ResetPasswordForm token={token} />
    </div>
  );
}

function InvalidLink({ reason }: { reason: "missing" | "invalid" | "expired" }) {
  const isExpired = reason === "expired";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-xl">Invalid reset link</CardTitle>
          <CardDescription>
            {isExpired ? "This reset link has expired." : "This reset link is invalid or has already been used."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isExpired
              ? "Password reset links expire after 1 hour. Please request a new one."
              : "The link may be malformed or was already used."}
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Link
            href="/forgot-password"
            className="text-sm text-foreground underline-offset-4 hover:underline"
          >
            Request a new reset link
          </Link>
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
