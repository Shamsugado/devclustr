# Item Types

> Reference for all 7 system item types in DevClustr.
>
> Sources: `context/project-overview.md`, `prisma/schema.prisma`, `prisma/seed.ts`
> Note: `src/lib/constants.tsx` did not exist at time of research.

---

## Individual Types

### Snippet

| Field       | Value      |
| ----------- | ---------- |
| Icon        | `Code`     |
| Color       | Blue       |
| Hex         | `#3b82f6`  |
| contentType | `TEXT`     |
| Pro Only    | No         |
| Seed ID     | `type_snippet` |

**Purpose:** Reusable code blocks, functions, hooks, config files, boilerplate — the primary type for storing actual code.

**Key fields used:**
- `content` — the code body (stored as `Text` in DB)
- `language` — syntax highlighting hint (e.g. `"typescript"`, `"bash"`, `"yaml"`)
- `description` — one-line summary of what the snippet does

**Seed examples:** React custom hooks (`useDebounce`, `useLocalStorage`), compound component pattern, utility functions (`cn`, `formatDate`, `slugify`), Docker Compose YAML.

---

### Prompt

| Field       | Value        |
| ----------- | ------------ |
| Icon        | `Sparkles`   |
| Color       | Purple       |
| Hex         | `#8b5cf6`    |
| contentType | `TEXT`       |
| Pro Only    | No           |
| Seed ID     | `type_prompt` |

**Purpose:** AI prompt templates with placeholders — system messages, chain-of-thought instructions, structured output formats.

**Key fields used:**
- `content` — the full prompt body, often containing `{{PLACEHOLDER}}` tokens
- `description` — what task the prompt accomplishes

**Seed examples:** Code review prompt (with severity categories), TSDoc generation prompt, refactoring assistance prompt.

---

### Command

| Field       | Value        |
| ----------- | ------------ |
| Icon        | `Terminal`   |
| Color       | Orange       |
| Hex         | `#f97316`    |
| contentType | `TEXT`       |
| Pro Only    | No           |
| Seed ID     | `type_command` |

**Purpose:** Shell commands, CLI recipes, bash scripts — runnable text intended for a terminal.

**Key fields used:**
- `content` — command text or multi-line script body
- `language` — typically `"bash"` for syntax highlighting
- `description` — what the command does

**Seed examples:** Git operations cheatsheet, Docker cleanup commands, process management (kill by port), package manager utilities (npm/pnpm/bun).

---

### Note

| Field       | Value        |
| ----------- | ------------ |
| Icon        | `StickyNote` |
| Color       | Yellow       |
| Hex         | `#fde047`    |
| contentType | `TEXT`       |
| Pro Only    | No           |
| Seed ID     | `type_note`  |

**Purpose:** Free-form markdown notes, documentation, explanations, meeting notes — unstructured prose that doesn't fit the other text categories.

**Key fields used:**
- `content` — Markdown body rendered with the project's Markdown editor
- `description` — optional subtitle or summary

**Seed examples:** None in seed file; intended for personal notes and documentation.

---

### Link

| Field       | Value      |
| ----------- | ---------- |
| Icon        | `Link`     |
| Color       | Emerald    |
| Hex         | `#10b981`  |
| contentType | `URL`      |
| Pro Only    | No         |
| Seed ID     | `type_link` |

**Purpose:** Bookmarked URLs — docs pages, tools, references, external resources.

**Key fields used:**
- `url` — the full web address
- `description` — what the page is and why it's useful

**Note:** `content` is not used for links; only `url` is stored. `language` and file fields are irrelevant.

**Seed examples:** Docker Compose reference docs, GitHub Actions workflow syntax, Tailwind CSS docs, shadcn/ui components, Radix UI primitives, Lucide icons.

---

### File

| Field       | Value      |
| ----------- | ---------- |
| Icon        | `File`     |
| Color       | Gray       |
| Hex         | `#6b7280`  |
| contentType | `FILE`     |
| Pro Only    | Yes        |
| Seed ID     | `type_file` |

**Purpose:** Arbitrary file uploads — PDFs, context files, configuration files, documents — stored on Cloudflare R2.

**Key fields used:**
- `fileUrl` — Cloudflare R2 object URL
- `fileName` — original filename on disk
- `fileSize` — size in bytes

**Note:** `content` is `null` for file types. Free users cannot create File items.

**Seed examples:** None (Pro-only, no demo data seeded).

---

### Image

| Field       | Value       |
| ----------- | ----------- |
| Icon        | `Image`     |
| Color       | Pink        |
| Hex         | `#ec4899`   |
| contentType | `FILE`      |
| Pro Only    | Yes         |
| Seed ID     | `type_image` |

**Purpose:** Image uploads (screenshots, diagrams, design references) stored on Cloudflare R2.

**Key fields used:**
- `fileUrl` — Cloudflare R2 object URL
- `fileName` — original image filename
- `fileSize` — size in bytes

**Note:** Same schema as File; distinguished by item type for filtering and display. Free users cannot create Image items.

**Seed examples:** None (Pro-only, no demo data seeded).

---

## Summaries

### Classification by contentType

| contentType | Types                                    | Key field(s)           |
| ----------- | ---------------------------------------- | ---------------------- |
| `TEXT`      | Snippet, Prompt, Command, Note           | `content`, `language`  |
| `URL`       | Link                                     | `url`                  |
| `FILE`      | File, Image                              | `fileUrl`, `fileName`, `fileSize` |

### Shared properties (all types)

All items share these fields regardless of type:

| Field        | Description                                      |
| ------------ | ------------------------------------------------ |
| `title`      | Required display name                            |
| `description`| Optional short summary                           |
| `isFavorite` | Starred by user                                  |
| `isPinned`   | Pinned to top of list                            |
| `lastUsedAt` | Tracked on each access for "recently used"       |
| `tags`       | Many-to-many via `TagsOnItems`                   |
| `collections`| Many-to-many via `ItemCollection`                |
| `itemTypeId` | FK to `ItemType` — determines icon, color, route |

### Display differences by contentType

| contentType | Card body shows        | Detail view shows             | Copy action    |
| ----------- | ---------------------- | ----------------------------- | -------------- |
| `TEXT`      | Content preview        | Full content with syntax hl   | Copy text      |
| `URL`       | URL and description    | Link preview / open in tab    | Copy URL       |
| `FILE`      | File name + size       | Download / preview (if image) | Download file  |

### Pro-gating

- `FILE` and `IMAGE` types are Pro-only at the plan level (no upload API access for free users).
- All other types are available on the Free plan (up to the 50-item limit).
- System types (`isSystem: true`, `userId: null`) cannot be modified by users; custom types are a planned Pro feature.

### URL routes per type

| Type    | Route              |
| ------- | ------------------ |
| Snippet | `/items/snippets`  |
| Prompt  | `/items/prompts`   |
| Command | `/items/commands`  |
| Note    | `/items/notes`     |
| Link    | `/items/links`     |
| File    | `/items/files`     |
| Image   | `/items/images`    |
