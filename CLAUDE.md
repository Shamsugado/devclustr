# DevStash

A developer knowledge hub for snippets, prompts, commands, notes, files, images, links and custom item types.

## Context Files

Read these for full project context:

- @context/project-overview.md: Features, data models, tech stack, UI/UX
- @context/coding-standards.md: Code conventions and patterns
- @context/ai-interaction.md : Workflow and communication guidelines
- @context/current-feature.md: What we are currently working on

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** — imported via `@import "tailwindcss"` in `globals.css`, configured through `@tailwindcss/postcss`
- **React Compiler** — enabled in `next.config.ts` via `reactCompiler: true`; do not manually add `useMemo`/`useCallback` where the compiler handles it
- **Path alias**: `@/*` maps to `src/*`
