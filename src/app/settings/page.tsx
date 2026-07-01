import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProfileUser, getEditorSettings } from "@/lib/db/users";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import DeleteAccountDialog from "@/components/profile/DeleteAccountDialog";
import EditorSettingsForm from "@/components/settings/EditorSettingsForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [user, editorSettings] = await Promise.all([
    getProfileUser(session.user.id),
    getEditorSettings(session.user.id),
  ]);
  if (!user) redirect("/sign-in");

  const isEmailUser = !!user.password;

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold">Settings</h1>

        {/* Editor section */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Editor
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Code editor</CardTitle>
            </CardHeader>
            <CardContent>
              <EditorSettingsForm initial={editorSettings} />
            </CardContent>
          </Card>
        </section>

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

        {/* Subscription section */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Subscription
          </h2>
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-1">Billing</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {user.isPro ? "You are on the Pro plan." : "You are on the Free plan."}
            </p>
            <Link
              href="/settings/billing"
              className="inline-flex items-center text-sm font-medium underline underline-offset-4"
            >
              Manage billing →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
