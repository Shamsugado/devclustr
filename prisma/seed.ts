import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const SYSTEM_ITEM_TYPES = [
  { id: "type_snippet", name: "Snippet", icon: "Code", color: "#3b82f6" },
  { id: "type_prompt", name: "Prompt", icon: "Sparkles", color: "#8b5cf6" },
  { id: "type_command", name: "Command", icon: "Terminal", color: "#f97316" },
  { id: "type_note", name: "Note", icon: "StickyNote", color: "#fde047" },
  { id: "type_link", name: "Link", icon: "Link", color: "#10b981" },
  { id: "type_file", name: "File", icon: "File", color: "#6b7280" },
  { id: "type_image", name: "Image", icon: "Image", color: "#ec4899" },
] as const;

async function main() {
  console.log("Seeding system item types...");
  for (const type of SYSTEM_ITEM_TYPES) {
    await prisma.itemType.upsert({
      where: { id: type.id },
      update: { name: type.name, icon: type.icon, color: type.color },
      create: { ...type, isSystem: true, userId: null },
    });
    console.log(`  ✓ ${type.name}`);
  }

  console.log("\nSeeding demo user...");
  const passwordHash = await bcrypt.hash("12345678", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: { password: passwordHash },
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      password: passwordHash,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  console.log("\nSeeding collections and items...");

  // ── React Patterns ────────────────────────────────────────────────────────

  const reactPatterns = await prisma.collection.upsert({
    where: { id: "col_react_patterns" },
    update: {},
    create: {
      id: "col_react_patterns",
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      userId: user.id,
      defaultTypeId: "type_snippet",
    },
  });

  const reactItems = await Promise.all([
    prisma.item.upsert({
      where: { id: "item_use_debounce" },
      update: {},
      create: {
        id: "item_use_debounce",
        title: "useDebounce & useLocalStorage hooks",
        contentType: "TEXT",
        language: "typescript",
        description: "Custom hooks for debouncing values and persisting state",
        content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  const set = (next: T) => {
    setValue(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  return [value, set] as const;
}`,
        userId: user.id,
        itemTypeId: "type_snippet",
        isFavorite: true,
      },
    }),

    prisma.item.upsert({
      where: { id: "item_context_pattern" },
      update: {},
      create: {
        id: "item_context_pattern",
        title: "Context provider + compound components",
        contentType: "TEXT",
        language: "typescript",
        description: "Type-safe context pattern with compound component API",
        content: `import { createContext, useContext, useState, ReactNode } from "react";

interface TabsCtx {
  active: string;
  setActive: (id: string) => void;
}

const TabsContext = createContext<TabsCtx | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("useTabs must be used within <Tabs>");
  return ctx;
}

function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultTab);
  return <TabsContext value={{ active, setActive }}>{children}</TabsContext>;
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { active, setActive } = useTabs();
  return (
    <button
      onClick={() => setActive(id)}
      data-active={active === id}
      className="px-4 py-2 data-[active=true]:underline"
    >
      {children}
    </button>
  );
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { active } = useTabs();
  return active === id ? <div>{children}</div> : null;
}

Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
export { Tabs };`,
        userId: user.id,
        itemTypeId: "type_snippet",
      },
    }),

    prisma.item.upsert({
      where: { id: "item_utility_fns" },
      update: {},
      create: {
        id: "item_utility_fns",
        title: "Common utility functions",
        contentType: "TEXT",
        language: "typescript",
        description: "cn(), formatDate(), truncate(), and other everyday helpers",
        content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}`,
        userId: user.id,
        itemTypeId: "type_snippet",
        isPinned: true,
      },
    }),
  ]);

  await Promise.all(
    reactItems.map((item) =>
      prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: reactPatterns.id } },
        update: {},
        create: { itemId: item.id, collectionId: reactPatterns.id },
      })
    )
  );
  console.log("  ✓ React Patterns (3 snippets)");

  // ── AI Workflows ──────────────────────────────────────────────────────────

  const aiWorkflows = await prisma.collection.upsert({
    where: { id: "col_ai_workflows" },
    update: {},
    create: {
      id: "col_ai_workflows",
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      userId: user.id,
      defaultTypeId: "type_prompt",
      isFavorite: true,
    },
  });

  const aiItems = await Promise.all([
    prisma.item.upsert({
      where: { id: "item_code_review_prompt" },
      update: {},
      create: {
        id: "item_code_review_prompt",
        title: "Code review prompt",
        contentType: "TEXT",
        description: "Thorough code review with security and performance focus",
        content: `You are a senior engineer performing a code review. Analyze the following code and provide feedback in these categories:

1. **Correctness** — Logic errors, edge cases, off-by-one errors
2. **Security** — Auth bypasses, injection risks, sensitive data exposure
3. **Performance** — N+1 queries, unnecessary re-renders, memory leaks
4. **Readability** — Naming, complexity, missing abstractions
5. **Test coverage** — What cases are untested?

For each issue, specify:
- Severity: critical / major / minor / nitpick
- File and line reference (if provided)
- Suggested fix

End with an overall recommendation: Approve / Request Changes / Needs Discussion.

Code to review:
\`\`\`
{{CODE}}
\`\`\``,
        userId: user.id,
        itemTypeId: "type_prompt",
        isFavorite: true,
        isPinned: true,
      },
    }),

    prisma.item.upsert({
      where: { id: "item_doc_gen_prompt" },
      update: {},
      create: {
        id: "item_doc_gen_prompt",
        title: "Documentation generation",
        contentType: "TEXT",
        description: "Generate JSDoc / TSDoc for functions and modules",
        content: `Generate comprehensive TypeScript documentation for the following code.

Requirements:
- Use TSDoc format (@param, @returns, @throws, @example)
- Include a one-line summary and a longer description if needed
- Document all public functions, types, and interfaces
- Add a realistic usage @example for each exported function
- Note any side effects or important constraints

Output only the documented code — no explanations outside the code block.

Code:
\`\`\`typescript
{{CODE}}
\`\`\``,
        userId: user.id,
        itemTypeId: "type_prompt",
      },
    }),

    prisma.item.upsert({
      where: { id: "item_refactor_prompt" },
      update: {},
      create: {
        id: "item_refactor_prompt",
        title: "Refactoring assistance",
        contentType: "TEXT",
        description: "Identify and apply targeted refactors without changing behavior",
        content: `Refactor the following code with these goals (in priority order):

1. Remove duplication — extract repeated logic into shared helpers
2. Simplify conditionals — prefer early returns and guard clauses
3. Improve naming — variables and functions should be self-documenting
4. Reduce nesting — flatten deeply nested blocks
5. No behavior changes — the external API and side effects must stay identical

Constraints:
- Do NOT add new features or error handling not already present
- Do NOT change function signatures unless strictly necessary
- Keep the same language/framework conventions

Return the refactored code followed by a bullet-point summary of every change made.

Code:
\`\`\`
{{CODE}}
\`\`\``,
        userId: user.id,
        itemTypeId: "type_prompt",
      },
    }),
  ]);

  await Promise.all(
    aiItems.map((item) =>
      prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: aiWorkflows.id } },
        update: {},
        create: { itemId: item.id, collectionId: aiWorkflows.id },
      })
    )
  );
  console.log("  ✓ AI Workflows (3 prompts)");

  // ── DevOps ────────────────────────────────────────────────────────────────

  const devops = await prisma.collection.upsert({
    where: { id: "col_devops" },
    update: {},
    create: {
      id: "col_devops",
      name: "DevOps",
      description: "Infrastructure and deployment resources",
      userId: user.id,
    },
  });

  const devopsItems = await Promise.all([
    prisma.item.upsert({
      where: { id: "item_docker_compose" },
      update: {},
      create: {
        id: "item_docker_compose",
        title: "Docker Compose — Next.js + Postgres",
        contentType: "TEXT",
        language: "yaml",
        description: "Production-ready compose file for a Next.js app with Postgres",
        content: `services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/app
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:`,
        userId: user.id,
        itemTypeId: "type_snippet",
      },
    }),

    prisma.item.upsert({
      where: { id: "item_deploy_script" },
      update: {},
      create: {
        id: "item_deploy_script",
        title: "Zero-downtime deploy to VPS",
        contentType: "TEXT",
        language: "bash",
        description: "Pull, build, migrate, and restart with rollback on failure",
        content: `#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/app"
IMAGE="ghcr.io/org/app"
TAG=\${1:-latest}

echo "Deploying $IMAGE:$TAG"

docker pull "$IMAGE:$TAG"

cd "$APP_DIR"
docker compose run --rm app npx prisma migrate deploy

docker compose up -d --no-deps --build app

echo "Deploy complete — running healthcheck..."
for i in {1..10}; do
  if curl -sf http://localhost:3000/api/health > /dev/null; then
    echo "Healthy after $i attempt(s)"
    exit 0
  fi
  sleep 3
done

echo "Healthcheck failed — rolling back"
docker compose up -d --no-deps app --scale app=0 || true
exit 1`,
        userId: user.id,
        itemTypeId: "type_command",
        isFavorite: true,
      },
    }),

    prisma.item.upsert({
      where: { id: "item_docker_docs_link" },
      update: {},
      create: {
        id: "item_docker_docs_link",
        title: "Docker Compose reference",
        contentType: "URL",
        url: "https://docs.docker.com/compose/compose-file/",
        description: "Official Compose file v3 reference documentation",
        userId: user.id,
        itemTypeId: "type_link",
      },
    }),

    prisma.item.upsert({
      where: { id: "item_gha_docs_link" },
      update: {},
      create: {
        id: "item_gha_docs_link",
        title: "GitHub Actions workflow syntax",
        contentType: "URL",
        url: "https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions",
        description: "Complete reference for GitHub Actions workflow YAML",
        userId: user.id,
        itemTypeId: "type_link",
      },
    }),
  ]);

  await Promise.all(
    devopsItems.map((item) =>
      prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: devops.id } },
        update: {},
        create: { itemId: item.id, collectionId: devops.id },
      })
    )
  );
  console.log("  ✓ DevOps (1 snippet, 1 command, 2 links)");

  // ── Terminal Commands ─────────────────────────────────────────────────────

  const terminalCmds = await prisma.collection.upsert({
    where: { id: "col_terminal_commands" },
    update: {},
    create: {
      id: "col_terminal_commands",
      name: "Terminal Commands",
      description: "Useful shell commands for everyday development",
      userId: user.id,
      defaultTypeId: "type_command",
    },
  });

  const terminalItems = await Promise.all([
    prisma.item.upsert({
      where: { id: "item_git_ops" },
      update: {},
      create: {
        id: "item_git_ops",
        title: "Git operations cheatsheet",
        contentType: "TEXT",
        language: "bash",
        description: "Undo commits, stash, rebase, and clean up branches",
        content: `# Undo last commit (keep changes staged)
git reset --soft HEAD~1

# Interactive rebase for last N commits
git rebase -i HEAD~5

# Stash with a message
git stash push -m "WIP: feature-name"

# Delete all merged local branches
git branch --merged main | grep -v "^\\* main" | xargs git branch -d

# Pretty log with graph
git log --oneline --graph --decorate --all

# Find which commit introduced a string
git log -S "searchString" --source --all

# Revert a specific file to HEAD
git checkout HEAD -- path/to/file`,
        userId: user.id,
        itemTypeId: "type_command",
        isFavorite: true,
        isPinned: true,
      },
    }),

    prisma.item.upsert({
      where: { id: "item_docker_cmds" },
      update: {},
      create: {
        id: "item_docker_cmds",
        title: "Docker cleanup commands",
        contentType: "TEXT",
        language: "bash",
        description: "Remove dangling images, stopped containers, and unused volumes",
        content: `# Remove all stopped containers
docker container prune -f

# Remove dangling images
docker image prune -f

# Full system prune (containers, images, networks, cache)
docker system prune -af --volumes

# List containers with size
docker ps -as

# Exec into running container
docker exec -it <container_name> sh

# Follow container logs
docker logs -f --tail 100 <container_name>

# Copy file from container
docker cp <container>:/path/to/file ./local-path`,
        userId: user.id,
        itemTypeId: "type_command",
      },
    }),

    prisma.item.upsert({
      where: { id: "item_process_mgmt" },
      update: {},
      create: {
        id: "item_process_mgmt",
        title: "Process management",
        contentType: "TEXT",
        language: "bash",
        description: "Kill processes by port, find memory hogs, background jobs",
        content: `# Kill process on a specific port (macOS/Linux)
lsof -ti tcp:3000 | xargs kill -9

# Find processes using a port
lsof -i :3000

# Top 10 memory-hungry processes
ps aux --sort=-%mem | head -10

# Run command in background and disown
nohup ./script.sh > output.log 2>&1 &
disown

# Watch a command every 2 seconds
watch -n 2 'df -h'

# Check open file descriptors per process
lsof -p <PID> | wc -l`,
        userId: user.id,
        itemTypeId: "type_command",
      },
    }),

    prisma.item.upsert({
      where: { id: "item_pkg_manager" },
      update: {},
      create: {
        id: "item_pkg_manager",
        title: "Package manager utilities",
        contentType: "TEXT",
        language: "bash",
        description: "npm/pnpm/bun commands for auditing, cleaning, and syncing deps",
        content: `# Clean install (delete node_modules + lockfile)
rm -rf node_modules package-lock.json && npm install

# Check for outdated packages
npm outdated

# Audit and auto-fix non-breaking vulnerabilities
npm audit fix

# List globally installed packages
npm list -g --depth=0

# Why is a package installed?
npm why <package-name>

# pnpm: deduplicate lockfile
pnpm dedupe

# bun: upgrade all deps to latest
bun update --latest`,
        userId: user.id,
        itemTypeId: "type_command",
      },
    }),
  ]);

  await Promise.all(
    terminalItems.map((item) =>
      prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: terminalCmds.id } },
        update: {},
        create: { itemId: item.id, collectionId: terminalCmds.id },
      })
    )
  );
  console.log("  ✓ Terminal Commands (4 commands)");

  // ── Design Resources ──────────────────────────────────────────────────────

  const designResources = await prisma.collection.upsert({
    where: { id: "col_design_resources" },
    update: {},
    create: {
      id: "col_design_resources",
      name: "Design Resources",
      description: "UI/UX resources and references",
      userId: user.id,
      defaultTypeId: "type_link",
    },
  });

  const designItems = await Promise.all([
    prisma.item.upsert({
      where: { id: "item_tailwind_docs" },
      update: {},
      create: {
        id: "item_tailwind_docs",
        title: "Tailwind CSS docs",
        contentType: "URL",
        url: "https://tailwindcss.com/docs",
        description: "Official Tailwind CSS v4 documentation and utility reference",
        userId: user.id,
        itemTypeId: "type_link",
        isFavorite: true,
      },
    }),

    prisma.item.upsert({
      where: { id: "item_shadcn_link" },
      update: {},
      create: {
        id: "item_shadcn_link",
        title: "shadcn/ui components",
        contentType: "URL",
        url: "https://ui.shadcn.com/docs/components",
        description: "Copy-paste component library built on Radix UI and Tailwind",
        userId: user.id,
        itemTypeId: "type_link",
        isFavorite: true,
      },
    }),

    prisma.item.upsert({
      where: { id: "item_radix_link" },
      update: {},
      create: {
        id: "item_radix_link",
        title: "Radix UI primitives",
        contentType: "URL",
        url: "https://www.radix-ui.com/primitives/docs/overview/introduction",
        description: "Unstyled, accessible component primitives for React",
        userId: user.id,
        itemTypeId: "type_link",
      },
    }),

    prisma.item.upsert({
      where: { id: "item_lucide_link" },
      update: {},
      create: {
        id: "item_lucide_link",
        title: "Lucide icons",
        contentType: "URL",
        url: "https://lucide.dev/icons/",
        description: "Open-source icon library used throughout this project",
        userId: user.id,
        itemTypeId: "type_link",
      },
    }),
  ]);

  await Promise.all(
    designItems.map((item) =>
      prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: designResources.id } },
        update: {},
        create: { itemId: item.id, collectionId: designResources.id },
      })
    )
  );
  console.log("  ✓ Design Resources (4 links)");

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
