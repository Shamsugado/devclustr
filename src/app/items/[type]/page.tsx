import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByTypeSlug } from "@/lib/db/items";
import ItemListClient from "@/components/items/ItemListClient";

export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) notFound();

  const items = await getItemsByTypeSlug(userId, type);

  const label = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-lg font-semibold text-foreground">{label}</h1>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {label.toLowerCase()} yet.</p>
      ) : (
        <ItemListClient items={items} />
      )}
    </div>
  );
}
