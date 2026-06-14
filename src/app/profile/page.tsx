import { auth } from "@/auth";
import UserAvatar from "@/components/auth/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <UserAvatar name={user?.name ?? "User"} image={user?.image} size="lg" />
            <div>
              <p className="text-sm font-medium text-foreground">{user?.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Profile settings are coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
