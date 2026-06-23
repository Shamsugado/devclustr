# Item CRUD Architecture

> Design for the unified CRUD system across all 7 item types.
>
> Sources: `context/project-overview.md`, `docs/item-types.md`, `prisma/schema.prisma`, existing codebase.

---

## Current State

The following already exists and should not be changed:

| File | Status |
|------|--------|
| `src/app/items/[type]/page.tsx` | Stub — resolves param, renders placeholder |
| `src/lib/db/items.ts` | Has dashboard queries (`getDashboardStats`, `getPinnedItems`, `getRecentItems`, `getSystemItemTypes`) — no item-list query yet |
| `src/lib/item-type-icons.tsx` | Complete icon map (Lucide name → component) |
| `src/app/dashboard/layout.tsx` | Loads sidebar data server-side, renders `DashboardShell` |

**Gap:** `/items/[type]` routes are outside the dashboard layout, so they have no sidebar. They need their own `layout.tsx`.

---

## Target File Structure

```
src/
├── actions/
│   └── items.ts                  # Server Actions: create, update, delete
│
├── lib/
│   ├── db/
│   │   └── items.ts              # Add: getItemsByType, getItemById
│   └── item-type-icons.tsx       # Already exists — no changes
│
├── app/
│   └── items/
│       ├── layout.tsx            # NEW: wraps /items/* with DashboardShell
│       └── [type]/
│           └── page.tsx          # Expand: resolve slug → query → render ItemList
│
└── components/
    └── items/
        ├── ItemList.tsx          # Grid of ItemCards, empty state
        ├── ItemCard.tsx          # Single card — border = type color, body adapts by contentType
        ├── ItemDrawer.tsx        # Slide-over: full detail + edit trigger
        ├── ItemForm.tsx          # Create/edit form — delegates to type-specific fields
        ├── DeleteItemDialog.tsx  # Confirm delete dialog
        └── fields/
            ├── TextItemFields.tsx  # content + language (Snippet, Command, Prompt, Note)
            ├── UrlItemFields.tsx   # url input (Link)
            └── FileItemFields.tsx  # file upload dropzone (File, Image)
```

---

## Routing: How `/items/[type]` Works

The `[type]` param is a **plural slug** matching the sidebar link pattern (`type.name.toLowerCase() + "s"`):

| Slug | itemTypeId |
|------|------------|
| `snippets` | `type_snippet` |
| `prompts` | `type_prompt` |
| `commands` | `type_command` |
| `notes` | `type_note` |
| `links` | `type_link` |
| `files` | `type_file` |
| `images` | `type_image` |

The page resolves the slug to an `itemTypeId` via a static map. An unrecognised slug calls `notFound()`.

```typescript
// src/app/items/[type]/page.tsx (expanded)
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByType } from "@/lib/db/items";
import ItemList from "@/components/items/ItemList";

const SLUG_TO_TYPE_ID: Record<string, string> = {
  snippets: "type_snippet",
  prompts:  "type_prompt",
  commands: "type_command",
  notes:    "type_note",
  links:    "type_link",
  files:    "type_file",
  images:   "type_image",
};

export default async function ItemTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const itemTypeId = SLUG_TO_TYPE_ID[type];
  if (!itemTypeId) notFound();

  const session = await auth();
  if (!session?.user) notFound();

  const items = await getItemsByType(session.user.id, itemTypeId);
  return <ItemList items={items} typeSlug={type} />;
}
```

---

## Data Layer (`src/lib/db/items.ts`)

Add two query functions to the existing file:

```typescript
// Get all items of a given type for the current user
export async function getItemsByType(userId: string, itemTypeId: string) {
  return prisma.item.findMany({
    where: { userId, itemTypeId },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  });
}

// Get a single item (for the drawer / edit form)
export async function getItemById(userId: string, itemId: string) {
  return prisma.item.findFirst({
    where: { id: itemId, userId },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });
}
```

Queries are called directly from **Server Components** — no API route needed for reads.

---

## Mutations (`src/actions/items.ts`)

Three Server Actions, each owner-scoped via `auth()`. All call `revalidatePath` after success.

```typescript
"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createItem(data: {
  title: string;
  itemTypeId: string;
  contentType: "TEXT" | "URL" | "FILE";
  content?: string;
  language?: string;
  url?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  description?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const item = await prisma.item.create({
    data: { ...data, userId: session.user.id },
  });
  revalidatePath("/items");
  return item;
}

export async function updateItem(
  itemId: string,
  data: Partial<{
    title: string;
    content: string;
    language: string;
    url: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    description: string;
    isFavorite: boolean;
    isPinned: boolean;
  }>
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Ownership check before update
  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId: session.user.id },
    select: { id: true },
  });
  if (!existing) throw new Error("Not found");

  const item = await prisma.item.update({ where: { id: itemId }, data });
  revalidatePath("/items");
  return item;
}

export async function deleteItem(itemId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.item.deleteMany({
    where: { id: itemId, userId: session.user.id },
  });
  revalidatePath("/items");
}
```

**Key rules:**
- Actions are type-agnostic — they receive whatever fields the form provides
- Ownership is always re-verified server-side (`userId` filter on read before write)
- `revalidatePath("/items")` refreshes the item list after any mutation

---

## Items Layout (`src/app/items/layout.tsx`)

Mirrors `src/app/dashboard/layout.tsx` exactly — loads sidebar data and wraps with `DashboardShell`:

```typescript
import DashboardShell from "@/components/dashboard/DashboardShell";
import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";

export default async function ItemsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;

  const [itemTypes, sidebarCollections] = user
    ? await Promise.all([getSystemItemTypes(), getSidebarCollections(user.id)])
    : [[], { favorites: [], recents: [] }];

  const sidebarData = {
    itemTypes,
    favoriteCollections: sidebarCollections.favorites,
    recentCollections: sidebarCollections.recents,
    user: user ? { name: user.name ?? "User", email: user.email ?? "", image: user.image ?? null } : null,
  };

  return <DashboardShell sidebarData={sidebarData}>{children}</DashboardShell>;
}
```

---

## Component Responsibilities

### `ItemList` (Client Component)

- Receives `items[]` and `typeSlug` from the server page
- Renders a responsive grid of `ItemCard` components
- Shows an empty state when `items.length === 0` (with a "Create your first X" CTA)
- Owns the open/close state of `ItemDrawer` and `DeleteItemDialog`

### `ItemCard` (Client Component)

- Receives one item with its `itemType` (icon, color)
- Left border or top accent uses `itemType.color`
- Body adapts by `contentType`:
  - `TEXT` → truncated content preview with optional language badge
  - `URL` → displays URL in muted style
  - `FILE` → shows `fileName` + formatted `fileSize`
- Action menu (⋯): opens `ItemDrawer` for edit, triggers `DeleteItemDialog`
- Favorite/pin toggles call `updateItem` inline

### `ItemDrawer` (Client Component)

- Slide-over panel (right side)
- Displays full item detail in read mode
- "Edit" button switches to `ItemForm` in edit mode
- Uses `updateItem` Server Action on save
- `contentType` determines the read-mode body:
  - `TEXT` → syntax-highlighted code block (Snippet/Command) or Markdown render (Note/Prompt)
  - `URL` → clickable link + description
  - `FILE` → download link; image preview for Image type

### `ItemForm` (Client Component)

- Shared form for both create (from a "New Item" drawer) and edit (from `ItemDrawer`)
- Always renders: `title`, `description`, tag input
- Delegates content fields to a sub-component based on `contentType`:
  - `TEXT` → `<TextItemFields />`
  - `URL` → `<UrlItemFields />`
  - `FILE` → `<FileItemFields />`
- Calls `createItem` or `updateItem` on submit

### `TextItemFields`

- `content` — textarea (large, monospace for Snippet/Command; prose for Note/Prompt)
- `language` — select dropdown for Snippet and Command types only (hidden for Note/Prompt)

### `UrlItemFields`

- `url` — input with `type="url"` and client-side validation

### `FileItemFields`

- Dropzone for file upload
- On file select: `POST /api/upload` → receives back the R2 `fileUrl`
- Stores `fileUrl`, `fileName`, `fileSize` in hidden fields for the action

### `DeleteItemDialog`

- shadcn `Dialog` with a confirm message
- On confirm: calls `deleteItem(itemId)`, closes drawer and dialog

---

## Where Type-Specific Logic Lives

**Components, not actions.** The rule of thumb:

| Concern | Location |
|---------|----------|
| Which fields to show in a form | `ItemForm` → delegates to `TextItemFields` / `UrlItemFields` / `FileItemFields` |
| How a card body is rendered | `ItemCard` — switch on `contentType` |
| How the detail view is rendered | `ItemDrawer` — switch on `contentType` |
| What to persist | `createItem` / `updateItem` — type-agnostic, persists whatever is passed |
| Which items to load | `getItemsByType` in `lib/db/items.ts` — filters by `itemTypeId` |

Actions never import `itemTypeIconMap` or check type names. They only enforce ownership and write to the DB.

---

## Data Flow Summary

```
User navigates to /items/snippets
  │
  └─► items/layout.tsx (Server)
        loads sidebar data → renders DashboardShell
        │
        └─► items/[type]/page.tsx (Server)
              resolves "snippets" → "type_snippet"
              calls getItemsByType(userId, "type_snippet")
              renders <ItemList items={...} />
                │
                └─► ItemCard × N  (Client)
                      click ⋯ → ItemDrawer opens
                        read mode → detail view
                        edit mode → ItemForm
                          submit → updateItem() Server Action
                                    → revalidatePath("/items")
                                    → page re-renders with fresh data
```

---

## What Is Not Covered Here

- `/api/upload` route for Cloudflare R2 (separate feature)
- Collections — items can be added to collections, handled in a `CollectionDrawer` (separate)
- Search — full-text search across items (separate feature)
- AI features — auto-tag, summarize, explain (Pro, separate feature)
- Pagination / infinite scroll (items list starts without it; add when needed)
