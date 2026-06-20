import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByTypeSlug, getSystemItemTypes } from "@/lib/db/items";
import ItemListClient from "@/components/items/ItemListClient";
import AddTypeButton from "@/components/items/AddTypeButton";

const ALLOWED_TYPES = ["snippet", "prompt", "command", "note", "link"];

export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) notFound();

  const [items, itemTypes] = await Promise.all([
    getItemsByTypeSlug(userId, type),
    getSystemItemTypes(),
  ]);

  const singularName = type.slice(0, -1); // "snippets" → "snippet"
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  const singularLabel = singularName.charAt(0).toUpperCase() + singularName.slice(1);

  const matchedType = itemTypes.find(
    (t) =>
      t.name.toLowerCase() === singularName &&
      ALLOWED_TYPES.includes(t.name.toLowerCase()),
  );

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
        <ItemListClient items={items} />
      )}
    </div>
  );
}
