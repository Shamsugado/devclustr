# Homepage Spec

## Overview

Implement the public marketing homepage at `/` based on `prototypes/homepage/`. The page is fully public (no auth required) and serves as the landing page for unauthenticated visitors. Authenticated users who land on `/` should be redirected to `/dashboard`.

## Route

- **Path**: `/` (replace or update `src/app/page.tsx`)
- Redirect logged-in users to `/dashboard` via server-side session check

## Component Structure

```
src/app/page.tsx                    ← server component (layout shell + redirect)
src/components/homepage/
  Navbar.tsx                        ← client component (mobile menu toggle)
  HeroSection.tsx                   ← server component
  HeroDashboardVisual.tsx           ← server component (static mini-dashboard graphic)
  FeaturesSection.tsx               ← server component
  AiSection.tsx                     ← server component
  PricingSection.tsx                ← client component (monthly/yearly toggle)
  CtaSection.tsx                    ← server component
  Footer.tsx                        ← server component
```

## Sections

### Navbar
- Logo: "DC" icon + "DevClustr" text (link to `/`)
- Nav links: Features (scroll to `#features`), Pricing (scroll to `#pricing`)
- Actions: **Sign In** → `/sign-in`, **Get Started** → `/register`
- Mobile hamburger menu (toggle with `useState`) — same links
- Sticky on scroll (add `sticky top-0 z-50 backdrop-blur` classes)

### Hero
- Headline: "Stop Losing Your **Developer Knowledge**" — gradient on second line (blue → indigo → purple)
- Subheading: from prototype
- CTAs: **Get Started Free** → `/register`, **See Features →** scrolls to `#features`
- Visual: two side-by-side boxes with a gradient arrow between them
  - Left box ("Your knowledge today..."): animated chaos canvas — implement as a client component (`HeroChaosCanvas.tsx`) using a simple `useEffect` canvas animation (floating colored dots bouncing randomly)
  - Right box ("...with DevClustr"): static mini-dashboard mockup (sidebar + cards) built with Tailwind divs, no canvas needed

### Features
- Section id: `features`
- 2×3 grid of feature cards, each with a colored icon, accent bar, title, and description
- Cards (color, title, description):
  1. Blue `#3b82f6` — Code Snippets — syntax highlighting, tags
  2. Amber `#f59e0b` — AI Prompts — personal prompt library
  3. Purple `#8b5cf6` — Instant Search — full-text + command palette
  4. Cyan `#06b6d4` — CLI Commands — flags, aliases, one-liners
  5. Slate `#64748b` — Files & Docs — uploads, PDFs, images
  6. Green `#22c55e` — Collections — group by project or team, pin favorites

### AI Section (Pro Feature)
- "Pro Feature" badge, headline, subheading
- Left: checklist of 4 AI capabilities (auto-generate tags, semantic search, content summaries, related suggestions)
- Right: mock code editor window showing `fetchUser.js` with syntax-highlighted JS and an "AI Generated Tags" panel below it (static HTML/Tailwind, no real editor)

### Pricing
- Section id: `pricing`
- Monthly / Yearly toggle (`useState`) — yearly shows 25% savings badge and adjusted price
- Prices: Free $0 | Pro $8/mo monthly → $6/mo yearly (billed $72/yr)
- Two cards: Free and Pro (Pro has "Most Popular" badge and primary styling)
- Free features: Up to 50 items, 3 collections, code snippets & prompts, basic search; AI and file storage crossed out
- Pro features: Unlimited items, unlimited collections, all item types, AI tagging & search, file & image storage (10 GB), priority support
- Buttons: Free **Get Started Free** → `/register`, Pro **Start Pro Trial** → `/register`

### CTA Section
- Headline, subtext
- **Get Started Free** → `/register`, **View Pricing** scrolls to `#pricing`

### Footer
- Brand column: logo + tagline "The developer knowledge hub"
- Link columns:
  - Product: Features (`#features`), Pricing (`#pricing`), Changelog (`#`)
  - Resources: Documentation (`#`), API (`#`), Status (`#`)
  - Company: About (`#`), Blog (`#`), Contact (`#`)
- Bottom bar: dynamic copyright year + Privacy Policy / Terms of Service links
- Placeholder `#` links are fine for now; they can be wired up later

## Styling Guidelines

- Dark background matching the app: `bg-[#0c0e16]` / `bg-[#13151f]` for cards/surfaces
- Use Tailwind utility classes throughout — no custom CSS files
- Use ShadCN `Button` component for CTAs where it makes sense; anchor tags are fine for nav links
- Gradient text: `bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent`
- Border color: `border-[#252838]`
- Muted text: `text-slate-500`
- Responsive: mobile-first, single column on small screens, grid layouts on `md:` and `lg:`
- Feature card hover: subtle `hover:border-[color]/50` border highlight + `hover:-translate-y-1 transition-transform`

## Implementation Notes

- No external animation libraries — use CSS transitions and `useEffect` canvas only
- `HeroChaosCanvas` is the only canvas element; wrap in `"use client"`
- `PricingSection` needs `"use client"` for the toggle; everything else is server components
- `Navbar` needs `"use client"` for mobile menu state
- Keep component files focused — extract the chaos canvas and pricing toggle as separate client components to minimize client JS
- Year in footer: use `new Date().getFullYear()` in a server component (no client needed)
