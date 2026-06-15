# DevClustr — Project Overview

> A fast, searchable, AI-enhanced hub for all developer knowledge & resources.

---

## The Problem

Developers keep their essentials scattered across too many places:

| Where it lives         | What's stored there |
| ---------------------- | ------------------- |
| VS Code / Notion       | Code snippets       |
| Chat history           | AI prompts          |
| Buried project folders | Context files       |
| Browser bookmarks      | Useful links        |
| Random folders         | Docs & notes        |
| `.txt` files           | Commands            |
| GitHub Gists           | Project templates   |
| Bash history           | Terminal commands   |

DevClustr consolidates everything into **one fast, searchable, AI-enhanced hub**.

---

## Target Users

| User                           | Need                                               |
| ------------------------------ | -------------------------------------------------- |
| **Everyday Developer**         | Quickly grab snippets, prompts, commands, links    |
| **AI-first Developer**         | Save prompts, contexts, workflows, system messages |
| **Content Creator / Educator** | Store code blocks, explanations, course notes      |
| **Full-stack Builder**         | Collect patterns, boilerplates, API examples       |

---

## Tech Stack

| Layer            | Technology                                                                      |
| ---------------- | ------------------------------------------------------------------------------- |
| **Framework**    | [Next.js 16](https://nextjs.org) / [React 19](https://react.dev)                |
| **Language**     | TypeScript                                                                      |
| **Database**     | [Neon](https://neon.tech) (PostgreSQL)                                          |
| **ORM**          | [Prisma 7](https://www.prisma.io/docs)                                          |
| **Auth**         | [NextAuth v5](https://authjs.dev) — email/password + GitHub OAuth               |
| **File Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2/)                          |
| **AI**           | [OpenAI](https://platform.openai.com/docs) — `gpt-4o-mini`                      |
| **CSS**          | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| **Caching**      | Redis _(optional, TBD)_                                                         |

> ⚠️ **DB rule:** Never use `db push`. Always create and run migrations explicitly in dev, then prod.

---

## Features

### A. Item Types

Items have a `contentType` of `text`, `url`, or `file`. URLs follow the pattern `/items/snippets`.

| Type    | Icon         | Color   | Hex       | Content Type | Pro Only |
| ------- | ------------ | ------- | --------- | ------------ | -------- |
| Snippet | `Code`       | Blue    | `#3b82f6` | text         | —        |
| Prompt  | `Sparkles`   | Purple  | `#8b5cf6` | text         | —        |
| Command | `Terminal`   | Orange  | `#f97316` | text         | —        |
| Note    | `StickyNote` | Yellow  | `#fde047` | text         | —        |
| Link    | `Link`       | Emerald | `#10b981` | url          | —        |
| File    | `File`       | Gray    | `#6b7280` | file         | ✅       |
| Image   | `Image`      | Pink    | `#ec4899` | file         | ✅       |

System types cannot be modified by users. Custom types will be added later (Pro).

Items are accessed and created via a **quick-access drawer**.

---

### B. Collections

- Users group items of any type into named collections
- An item can belong to **multiple collections** (many-to-many)
- Examples: `React Patterns`, `Interview Prep`, `Context Files`, `Python Snippets`

---

### C. Search

Full-text search across:

- Title
- Content
- Tags
- Item type

---

### D. Authentication

- Email/password
- GitHub OAuth (via NextAuth v5)

---

### E. General Features

- ⭐ Favorite items & collections
- 📌 Pin items to top
- 🕐 Recently used tracking
- 📥 Import code from file
- ✍️ Markdown editor for text types
- 📎 File upload for `file`/`image` types
- 📤 Export data (JSON / ZIP)
- 🌙 Dark mode default, light mode optional
- 🔗 Add/remove items to/from multiple collections
- 🗂️ View which collections an item belongs to

---

### F. AI Features _(Pro only)_

- 🏷️ Auto-tag suggestions
- 📝 AI Summaries
- 💡 Explain This Code
- 🚀 Prompt Optimizer

---

## Monetization

| Feature              | Free                  | Pro ($8/mo or $72/yr) |
| -------------------- | --------------------- | --------------------- |
| Items                | 50 total              | Unlimited             |
| Collections          | 3                     | Unlimited             |
| Item types           | All except file/image | All types             |
| File & image uploads | ❌                    | ✅                    |
| AI features          | ❌                    | ✅                    |
| Custom types         | ❌                    | ✅ _(coming later)_   |
| Export (JSON/ZIP)    | ❌                    | ✅                    |
| Priority support     | ❌                    | ✅                    |
| Search               | Basic                 | Full                  |

> 🛠️ During development, all users have full access regardless of plan.

---

## UI / UX

### Layout

```
┌─────────────────────────────────────────────────────┐
│  [Sidebar]          │  [Main Content]                │
│                     │                                │
│  ▸ Snippets         │  ┌──────┐ ┌──────┐ ┌──────┐  │
│  ▸ Prompts          │  │ Coll │ │ Coll │ │ Coll │  │
│  ▸ Commands         │  └──────┘ └──────┘ └──────┘  │
│  ▸ Notes            │                                │
│  ▸ Links            │  Items (color-coded cards)     │
│  ─────────────────  │                                │
│  Collections        │  ┌──────┐ ┌──────┐ ┌──────┐  │
│  ▸ React Patterns   │  │ Item │ │ Item │ │ Item │  │
│  ▸ Interview Prep   │  └──────┘ └──────┘ └──────┘  │
│                     │                                │
└─────────────────────────────────────────────────────┘
```

- **Sidebar**: Collapsible; item type links + latest collections; becomes a drawer on mobile
- **Main**: Color-coded collection cards (background = dominant item type color); item cards (border = type color)
- **Individual items**: Open in a slide-over drawer
- **References**: [Notion](https://notion.so), [Linear](https://linear.app), [Raycast](https://raycast.com)

### Design Principles

- Modern, minimal, developer-focused
- Dark mode default
- Clean typography, generous whitespace
- Subtle borders and shadows
- Syntax highlighting for code blocks
- Smooth transitions, hover states, toast notifications, loading skeletons

### Screenshots

Refer to the screenshots below as a base for the dashboard UI. It does not have to be exact. Use it as a reference.

@context/screenshots/dashboard-ui-main.png
@context/screenshots/dashboard-ui-drawer.png

### Responsive

- Desktop-first
- Sidebar collapses to drawer on mobile

---

## Data Model

> ⚠️ **Rough draft — subject to change. Do not run migrations from this directly.**

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Extends NextAuth User
model User {
  id                   String    @id @default(cuid())
  name                 String?
  email                String?   @unique
  emailVerified        DateTime?
  image                String?
  isPro                Boolean   @default(false)
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  accounts    Account[]
  sessions    Session[]
  items       Item[]
  collections Collection[]
  itemTypes   ItemType[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

enum ContentType {
  TEXT
  FILE
  URL
}

model ItemType {
  id       String  @id @default(cuid())
  name     String
  icon     String  // Lucide icon name e.g. "Code", "Sparkles"
  color    String  // Hex color e.g. "#3b82f6"
  isSystem Boolean @default(false)

  userId String? // null for system types
  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items       Item[]
  collections Collection[] @relation("CollectionDefaultType")

  @@map("item_types")
}

model Item {
  id          String      @id @default(cuid())
  title       String
  contentType ContentType
  content     String?     @db.Text // null if file type
  fileUrl     String?     // Cloudflare R2 URL
  fileName    String?     // original filename
  fileSize    Int?        // bytes
  url         String?     // for link types
  description String?
  language    String?     // e.g. "typescript", "python"
  isFavorite  Boolean     @default(false)
  isPinned    Boolean     @default(false)
  lastUsedAt  DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemTypeId String
  itemType   ItemType @relation(fields: [itemTypeId], references: [id])

  tags        TagsOnItems[]
  collections ItemCollection[]

  @@map("items")
}

model Collection {
  id            String   @id @default(cuid())
  name          String
  description   String?
  isFavorite    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  defaultTypeId String?
  defaultType   ItemType? @relation("CollectionDefaultType", fields: [defaultTypeId], references: [id])

  items ItemCollection[]

  @@map("collections")
}

// Join table: Item <-> Collection (many-to-many)
model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item       Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
  @@map("item_collections")
}

model Tag {
  id    String        @id @default(cuid())
  name  String        @unique
  items TagsOnItems[]

  @@map("tags")
}

// Join table: Item <-> Tag (many-to-many)
model TagsOnItems {
  itemId String
  tagId  String

  item Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
  @@map("tags_on_items")
}
```

---

## API Routes (planned)

| Method             | Route                                  | Description                       |
| ------------------ | -------------------------------------- | --------------------------------- |
| `GET/POST`         | `/api/items`                           | List / create items               |
| `GET/PATCH/DELETE` | `/api/items/[id]`                      | Read / update / delete item       |
| `GET/POST`         | `/api/collections`                     | List / create collections         |
| `GET/PATCH/DELETE` | `/api/collections/[id]`                | Read / update / delete collection |
| `POST`             | `/api/collections/[id]/items`          | Add item to collection            |
| `DELETE`           | `/api/collections/[id]/items/[itemId]` | Remove item from collection       |
| `POST`             | `/api/upload`                          | Upload file to R2                 |
| `POST`             | `/api/ai/tag`                          | AI auto-tag suggestions           |
| `POST`             | `/api/ai/explain`                      | AI explain code                   |
| `POST`             | `/api/ai/summarize`                    | AI summarize item                 |
| `POST`             | `/api/ai/optimize-prompt`              | AI prompt optimizer               |
| `GET`              | `/api/export`                          | Export user data                  |
| `POST`             | `/api/webhooks/stripe`                 | Stripe subscription events        |

---

## URL Structure

| URL                 | Description                    |
| ------------------- | ------------------------------ |
| `/`                 | Dashboard / home               |
| `/items`            | All items                      |
| `/items/snippets`   | Items filtered by type         |
| `/items/prompts`    | Items filtered by type         |
| `/items/commands`   | Items filtered by type         |
| `/items/notes`      | Items filtered by type         |
| `/items/links`      | Items filtered by type         |
| `/items/files`      | Items filtered by type _(Pro)_ |
| `/items/images`     | Items filtered by type _(Pro)_ |
| `/collections`      | All collections                |
| `/collections/[id]` | Single collection view         |
| `/settings`         | User settings                  |
| `/settings/billing` | Subscription management        |

---

## Key External Docs

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma 7 Docs](https://www.prisma.io/docs)
- [NextAuth v5 Docs](https://authjs.dev/getting-started)
- [Neon Docs](https://neon.tech/docs)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Stripe Docs](https://docs.stripe.com)
- [Lucide Icons](https://lucide.dev/icons/) _(for item type icons)_

---

## Open Questions / TBD

- [ ] Redis caching — is it needed at launch?
- [ ] Custom item types — scoped to Pro, build after core launch
- [ ] Search — basic string match first, consider [pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html) or a dedicated search solution later
- [ ] Rate limiting on AI routes
- [ ] Email provider for magic links / transactional email (e.g. [Resend](https://resend.com))
- [ ] Analytics (e.g. [PostHog](https://posthog.com))
