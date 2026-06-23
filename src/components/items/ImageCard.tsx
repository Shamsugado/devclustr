import type { ItemWithType } from "@/lib/db/items";

export default function ImageCard({
  item,
  onClick,
}: {
  item: ItemWithType;
  onClick?: () => void;
}) {
  return (
    <div
      className="group cursor-pointer rounded-lg overflow-hidden border border-border bg-card"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {item.fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/items/${item.id}/download`}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
      </div>
    </div>
  );
}
