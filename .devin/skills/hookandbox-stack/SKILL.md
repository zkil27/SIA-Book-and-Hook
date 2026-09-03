---
name: hookandbox-stack
description: >-
  Project-specific engineering rules for the Hook & Box capstone (fictional
  seafood retailer storefront + admin). Use for ANY code, schema, config, or
  dependency work in this repo. Covers Next.js 16 App Router gotchas, the Prisma
  singleton, money-as-centavos, soft-deletes, the append-only StockMovement
  ledger, NextAuth v5 beta role gating, and the Supabase dual-connection-string
  setup. Triggers on "Next.js 16", "app router", "server action", "route
  handler", "Prisma", "PrismaClient", "schema.prisma", "migration", "centavos",
  "price", "stock", "StockMovement", "soft delete", "active flag", "NextAuth",
  "auth.ts", "auth.config.ts", "role", "admin gate", "Supabase", "DATABASE_URL",
  "DIRECT_URL", "pgbouncer", "seed", "Vercel build".
---

# Hook & Box — Stack Rules

Academic capstone graded on a live deployed URL. Fictional data only. Two
interfaces: a customer storefront and a role-gated admin panel. The load-bearing
feature is the append-only **stock movement ledger** — treat it as the center of
gravity, not the storefront.

Read `docs/` before guessing; it is authoritative. If code and a doc disagree,
`prisma/schema.prisma` and the code win — then fix the doc in the same turn.
Every change must be logged in `docs/changelog.md` (see AGENTS.md).

## Money, stock, soft-delete — the three non-negotiables

- **Money is `Int` centavos, never a float.** ₱299.00 is stored as `29900`.
  Do all arithmetic in centavos; divide by 100 only when rendering. `Order.totalCentavos`
  and `OrderItem.priceAtTime` are stored, not recalculated, so history stays stable.
  Price/stock live on `ProductVariant` (`priceCentavos`), not `Product`.
- **Stock changes ALWAYS write a new `StockMovement` row** (`quantity` +/-,
  `reason`, `createdAt`). Never overwrite a stock number. Current stock = sum of
  movements for the variant. Never edit or delete a ledger row — correct a
  mistake with a compensating movement (e.g. a +5 to cancel an erroneous -5).
- **Products and variants are soft-deleted** with `active = false`, never
  hard-deleted, because orders reference them. Filter `active: true` in
  customer-facing queries.

## Prisma

- **Only ever import the singleton** from `@/lib/prisma` (`import prisma from '@/lib/prisma'`).
  A stray `new PrismaClient()` exhausts Supabase connections ("Too many connections").
- Schema is the source of truth: 7 models (`User`, `Category`, `Product`,
  `ProductVariant`, `Order`, `OrderItem`, `StockMovement`); enums `Role`
  (CUSTOMER | ADMIN) and `OrderStatus` (PENDING → CONFIRMED → READY → COMPLETED |
  CANCELLED).
- Schema change loop: edit `schema.prisma` → `npx prisma migrate dev --name <slug>`
  (this uses `DIRECT_URL`) → commit the migration → update `docs/data-model.md`
  and regenerate the ERD in `docs/diagrams/`.
- Seed: `npx prisma db seed` runs `tsx prisma/seed.ts` (~50 products expected).
  The seed is the de-facto backup on Supabase's free tier — keep it committed
  and current.

## Supabase — two connection strings, both required

- `DATABASE_URL` — pooled, port **6543**, `?pgbouncer=true`. App runtime.
- `DIRECT_URL` — direct, port **5432**. Migrations only; they cannot run through
  the pooler.
- Set both in `.env.local` locally AND in Vercel for every environment. Never
  commit `.env.local`. See `docs/deployment.md`.

## Next.js 16 (App Router) — this is NOT the Next.js in training data

Next.js 16.3.4 + React 19.2 has breaking changes to APIs, conventions, and file
structure. Before writing routes, layouts, server actions, or config, read the
relevant guide under `node_modules/next/dist/docs/` (resolved from the file's
directory). Heed deprecation notices. Leave the auto-generated `AGENTS.md` block
in place. Example already-changed API: `RootLayout` uses `LayoutProps<"/">`.

- Validate input with `zod` at every server action / route handler boundary.
- Hash passwords with `bcryptjs`; store `passwordHash` only, never plaintext.
- The prototype `app/page.tsx` is a ~1200-line `"use client"` monolith with
  hardcoded `PRODUCTS`/`ORDERS`. When wiring real data, decompose into real
  routes/components — do not extend the monolith. Reuse its brand palette and
  `Btn`/`Card`/`Tag`/`FieldInput` primitives and `font-['Russo_One']` headings
  for visual consistency.

## NextAuth v5 beta — role gating

- Setup lives in `auth.ts` (Credentials + JWT session; role added in the
  `session` callback) and `auth.config.ts` (edge-safe: `pages.signIn = '/login'`,
  `authorized()` gate for `/admin`). Handler re-exported from
  `app/api/auth/[...nextauth]/route.ts`.
- Scope requires a CUSTOMER to be actually rejected from `/admin`, not just
  authenticated. The edge `authorized()` callback currently only checks
  logged-in state and defers the role check — enforce `role === 'ADMIN'` for
  admin routes (in the callback if the session type is extended, otherwise in the
  admin layout/page). Do not treat "logged in" as "is admin".

## Scope guardrails (default to "no")

No real payment processing (checkout records GCash/COD + static instructions;
orders end `PENDING`). No courier/GPS ("Lalamove" is a label). No email/SMS. No
image upload (placeholder URLs only). No automated test suite (manual
verification). When asked for a feature, check `docs/scope.md` first and default
to the out-of-scope section rather than building it.

## Commands (Windows / PowerShell — use `;` not `&&`, `$env:VAR` not `%VAR%`)

- Dev server: `npm run dev` (long-running — ask the user to run it; don't launch
  it in a blocking call).
- Lint: `npm run lint`. Typecheck: `npx tsc --noEmit`.
- Prisma: `npx prisma migrate dev --name <slug>`, `npx prisma generate`,
  `npx prisma db seed`.
- `build` is `prisma generate && next build` and `postinstall` is
  `prisma generate` — both required so Vercel doesn't use a stale cached Prisma
  client. Package manager is npm.
