import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getCollectionById } from "@/lib/db/collections";
import { getItemsByCollectionId } from "@/lib/db/items";
import ItemListClient from "@/components/items/ItemListClient";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) notFound();

  const [collection, items] = await Promise.all([
    getCollectionById(userId, id),
    getItemsByCollectionId(userId, id),
  ]);

  if (!collection) notFound();

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{collection.name}</h1>
        {collection.description && (
          <p className="text-sm text-muted-foreground mt-0.5">{collection.description}</p>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
      ) : (
        <ItemListClient items={items} />
      )}
    </div>
  );
}
