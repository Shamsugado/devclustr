export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const label = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="p-4">
      <h2 className="text-foreground font-semibold text-lg">{label}</h2>
    </div>
  );
}
