---
inclusion: always
---

# Structure & Current State

## Layout

```
app/                     Next.js App Router
  api/auth/[...nextauth]/route.ts   NextAuth handler (re-exports GET/POST from auth.ts)
  layout.tsx             Root layout (Geist fonts, Tailwind)
  page.tsx               *** entire prototype UI lives here — see below ***
  globals.css
auth.ts                  NextAuth setup (Credentials, session role callback)
auth.config.ts           Edge-safe config: pages.signIn=/login, authorized() gate for /admin
lib/prisma.ts            PrismaClient singleton — always import from here
prisma/schema.prisma     7 models (source of truth for the data model)
docs/                    Excellent, authoritative docs — read these, don't guess
  scope.md               FROZEN scope (feature source of truth)
  data-model.md          Plain-language entity reference + design rationale
  deployment.md          Supabase + Vercel runbook
  demo-runbook.md        Sept-demo script
  plan-14-days.md        The build plan and cut list
  srs-outline.md         SRS doc structure
  team-workflow.md       Branching/PR/commit rules
prototype_src/           Legacy Vite prototype (excluded from tsconfig — ignore)
imports/, public/imports/  Figma-exported logo assets
.kiro/steering/          These steering files
```

## The prototype UI (important)

`app/page.tsx` is a single ~1200-line `"use client"` component holding EVERY
screen (storefront, admin, checkout, tracking, about, contact) with **hardcoded
mock arrays** (`PRODUCTS`, `ORDERS`). It has its own inline icon set, `Btn`,
`Card`, `Tag`, `FieldInput` primitives, and a fixed brand palette (documented in
a comment block at the top of the file). Admin "auth" is a fake `admin123`
prompt. Nothing reads from the database yet. When wiring real data/routes,
decompose this into real routes/components rather than extending the monolith.

## Conventions

- Path alias `@/*` → project root (e.g. `@/lib/prisma`, `@/auth`).
- Commits: present tense, one logical change ("add stock movement model").
- Branches: `feat/`, `fix/`, `docs/`, `chore/`. `main` is protected — work via PRs.
- Brand palette + `font-['Russo_One']` headings established in `app/page.tsx`;
  reuse those tokens for visual consistency.

## Current state vs plan (where the gaps are)

Roughly at the end-of-Week-1 gate. Skeleton + docs are strong; DB integration is
missing. Highest-impact gaps, in order:

1. **No `prisma/seed.ts`** and **no `prisma/migrations/`** — docs call the seed
   "your backup"; ~50 products expected. Nothing has been migrated.
2. **`build` script** not fixed for Vercel (see tech.md).
3. **No DB-backed pages** — storefront still renders hardcoded arrays.
4. **No `/login` or `/admin` routes** — `auth.config.ts` points at `/login`
   which doesn't exist; admin gate defers role check to pages (a CUSTOMER is
   not yet actually rejected from `/admin`, which the scope requires).
5. No keep-alive cron (`app/api/keep-alive/route.ts` + `vercel.json`).

Never cut (per plan): live deployment, seeded data, admin auth, product CRUD,
stock history screen.
