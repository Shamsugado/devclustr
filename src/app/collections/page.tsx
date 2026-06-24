import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getAllCollections } from "@/lib/db/collections";
import CollectionCard from "@/components/collections/CollectionCard";

export default async function CollectionsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) notFound();

  const collections = await getAllCollections(userId);

  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-lg font-semibold text-foreground">Collections</h1>

      {collections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No collections yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      )}
    </div>
  );
}
