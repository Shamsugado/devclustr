import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getAllCollectionsPaginated } from "@/lib/db/collections";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import CollectionCard from "@/components/collections/CollectionCard";
import Pagination from "@/components/ui/Pagination";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) notFound();

  const { collections, total } = await getAllCollectionsPaginated(userId, {
    page,
    pageSize: COLLECTIONS_PER_PAGE,
  });

  const totalPages = Math.ceil(total / COLLECTIONS_PER_PAGE);

  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-lg font-semibold text-foreground">Collections</h1>

      {collections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No collections yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {collections.map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} basePath="/collections" />
        </>
      )}
    </div>
  );
}
