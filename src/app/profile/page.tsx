import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { File } from "lucide-react";
import { getProfileUser, getItemTypeCounts } from "@/lib/db/users";
import { getDashboardStats } from "@/lib/db/items";
import { itemTypeIconMap } from "@/lib/item-type-icons";
import UserAvatar from "@/components/auth/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [user, stats, itemTypeCounts] = await Promise.all([
    getProfileUser(session.user.id),
    getDashboardStats(session.user.id),
    getItemTypeCounts(session.user.id),
  ]);

  if (!user) redirect("/sign-in");

  const joinDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(user.createdAt);

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* User info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <UserAvatar name={user.name ?? "User"} image={user.image} size="lg" />
              <div>
                <p className="text-base font-medium">{user.name ?? "User"}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Joined {joinDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage stats */}
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
                <p className="text-sm text-muted-foreground">Total items</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCollections}</p>
                <p className="text-sm text-muted-foreground">Total collections</p>
              </div>
            </div>

            {itemTypeCounts.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground">By type</p>
                <div className="space-y-1.5">
                  {itemTypeCounts
                    .filter((t) => t.count > 0)
                    .sort((a, b) => b.count - a.count)
                    .map((type) => (
                      <div key={type.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = itemTypeIconMap[type.icon] ?? File;
                            return <Icon className="h-4 w-4 shrink-0" style={{ color: type.color }} />;
                          })()}
                          <span className="capitalize">{type.name}</span>
                        </div>
                        <span className="tabular-nums text-muted-foreground">{type.count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
