import { auth } from "@/auth";
import { getFavoriteItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import FavoritesClient from "@/components/favorites/FavoritesClient";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [items, collections] = await Promise.all([
    getFavoriteItems(session.user.id),
    getFavoriteCollections(session.user.id),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-mono text-lg font-semibold text-foreground mb-6">Favorites</h1>
      <FavoritesClient items={items} collections={collections} />
    </div>
  );
}
