# DevClustr

A developer knowledge hub for snippets, prompts, commands, notes, files, images, links and custom item types.

## Context Files

Read these for full project context:

- @context/project-overview.md: Features, data models, tech stack, UI/UX
- @context/coding-standards.md: Code conventions and patterns
- @context/ai-interaction.md : Workflow and communication guidelines
- @context/current-feature.md: What we are currently working on

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run start      # Serve production build
npm run lint       # Run ESLint
npm test           # Run unit tests (Vitest, one-shot)
npm run test:watch # Run unit tests in watch mode
```

Unit tests cover server actions and utilities only (no component tests). Test files live alongside source in `__tests__/` directories or as `*.test.ts` files.

## Database (Neon MCP)

- The Neon project for this app is named **devclustr** (id `small-fog-21994349`), org `Shamsu`.
- Always use the **development** branch (`br-divine-tree-ap7wvosc`) for any Neon MCP queries or operations, unless explicitly told otherwise.
- **Never** read from, write to, or otherwise touch the **production** branch (`br-round-frog-apxz0nro`, the default branch) unless the user explicitly asks for production.
- Before running any SQL via the Neon MCP, confirm you're targeting the development branch ID above.

## Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** — imported via `@import "tailwindcss"` in `globals.css`, configured through `@tailwindcss/postcss`
- **React Compiler** — enabled in `next.config.ts` via `reactCompiler: true`; do not manually add `useMemo`/`useCallback` where the compiler handles it
- **Path alias**: `@/*` maps to `src/*`
