import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByTypeSlug, getSystemItemTypes } from "@/lib/db/items";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { canAccessItemTypeSlug } from "@/lib/tier";
import ItemListClient from "@/components/items/ItemListClient";
import AddTypeButton from "@/components/items/AddTypeButton";
import Pagination from "@/components/ui/Pagination";

const ALLOWED_TYPES = ["snippet", "prompt", "command", "note", "link", "image", "file"];

export default async function ItemTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { type } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) notFound();

  const label = type.charAt(0).toUpperCase() + type.slice(1);

  if (!canAccessItemTypeSlug(type, !!session.user.isPro)) {
    redirect("/upgrade");
  }

  const [pageResult, itemTypes] = await Promise.all([
    getItemsByTypeSlug(userId, type, { page, pageSize: ITEMS_PER_PAGE }),
    getSystemItemTypes(),
  ]);
  const { items, total } = pageResult;

  const singularName = type.slice(0, -1); // "snippets" → "snippet"
  const singularLabel = singularName.charAt(0).toUpperCase() + singularName.slice(1);

  const matchedType = itemTypes.find(
    (t) =>
      t.name.toLowerCase() === singularName &&
      ALLOWED_TYPES.includes(t.name.toLowerCase()),
  );

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">{label}</h1>
        {matchedType && (
          <AddTypeButton
            label={singularLabel}
            itemTypes={itemTypes}
            initialTypeId={matchedType.id}
          />
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {label.toLowerCase()} yet.</p>
      ) : (
        <>
          <ItemListClient items={items} />
          <Pagination page={page} totalPages={totalPages} basePath={`/items/${type}`} />
        </>
      )}
    </div>
  );
}
