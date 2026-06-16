import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>We sent you a verification link</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to verify your account. The link expires in 24 hours.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive an email?{" "}
            <Link href="/resend-verification" className="text-foreground underline-offset-4 hover:underline">
              Resend verification email
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
