import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getCollectionById } from "@/lib/db/collections";
import { getItemsByCollectionId } from "@/lib/db/items";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import ItemListClient from "@/components/items/ItemListClient";
import CollectionDetailActions from "@/components/collections/CollectionDetailActions";
import Pagination from "@/components/ui/Pagination";

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) notFound();

  const [collection, pageResult] = await Promise.all([
    getCollectionById(userId, id),
    getItemsByCollectionId(userId, id, { page, pageSize: COLLECTIONS_PER_PAGE }),
  ]);

  if (!collection) notFound();

  const { items, total } = pageResult;
  const totalPages = Math.ceil(total / COLLECTIONS_PER_PAGE);

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{collection.name}</h1>
          {collection.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{collection.description}</p>
          )}
        </div>
        <CollectionDetailActions collection={collection} />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
      ) : (
        <>
          <ItemListClient items={items} />
          <Pagination page={page} totalPages={totalPages} basePath={`/collections/${id}`} />
        </>
      )}
    </div>
  );
}
