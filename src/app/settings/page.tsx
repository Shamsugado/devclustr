import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProfileUser } from "@/lib/db/users";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import DeleteAccountDialog from "@/components/profile/DeleteAccountDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await getProfileUser(session.user.id);
  if (!user) redirect("/sign-in");

  const isEmailUser = !!user.password;

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold">Settings</h1>

        {/* Account section */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Account
          </h2>

          {isEmailUser && (
            <Card>
              <CardHeader>
                <CardTitle>Change password</CardTitle>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          )}

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
              <DeleteAccountDialog />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
