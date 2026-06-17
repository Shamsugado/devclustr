import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/token";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <VerifyResult success={false} reason="missing" />;
  }

  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: hashToken(token) },
  });

  if (!user) {
    return <VerifyResult success={false} reason="invalid" />;
  }

  if (!user.emailVerificationTokenExpiry || user.emailVerificationTokenExpiry < new Date()) {
    return <VerifyResult success={false} reason="expired" email={user.email ?? undefined} />;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailVerificationTokenExpiry: null,
    },
  });

  redirect("/sign-in?verified=1");
}

function VerifyResult({
  success,
  reason,
  email,
}: {
  success: boolean;
  reason?: string;
  email?: string;
}) {
  const isExpired = reason === "expired";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-xl">
            {success ? "Email verified!" : "Verification failed"}
          </CardTitle>
          <CardDescription>
            {isExpired
              ? "This verification link has expired."
              : "This verification link is invalid."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isExpired
              ? "Verification links expire after 24 hours. Please request a new one."
              : "The link may have already been used or is malformed."}
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {isExpired && email && (
            <Link
              href={`/resend-verification?email=${encodeURIComponent(email)}`}
              className="text-sm text-foreground underline-offset-4 hover:underline"
            >
              Resend verification email
            </Link>
          )}
          <Link
            href="/sign-in"
            className="text-sm text-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
