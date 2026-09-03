<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- The block above is auto-generated and re-added by `next dev`. Leave it in place. -->
<!-- Everything below is the portable, cross-tool project contract. Keep it tool-agnostic. -->

# Hook & Box — Agent Guide

Portable project context for any AI coding tool (Kiro, Cursor, Antigravity,
Claude, Codex, Windsurf, etc.). This file is the single source of truth; the
tool-specific files (`CLAUDE.md`, `.cursor/rules/`, Kiro's `.kiro/steering/`)
point back here so the context stays consistent across tools.

## Product

Academic capstone (course code "SIA") for a **fictional** fresh-seafood retailer
in Dasmariñas City, Philippines. Graded on a **live deployed URL**, not a local
run. No real business, no real transactions — all data is seeded and fictional.

Two interfaces:

- **Storefront** — browse a seafood catalog by category, view product detail
  with real-time stock and price-per-variant, build a client-side cart, move
  through a multi-step checkout (review → delivery info → payment method →
  confirmation), track an order by ID, and view own order history.
- **Admin panel** — role-gated staff area: product/variant CRUD, category
  management, stock adjustments (append-only ledger), order status updates, and
  a basic dashboard (counts, alerts, simple hand-built charts).

**The load-bearing feature is the stock movement ledger** — an append-only audit
trail. Every stock change writes a `StockMovement` row with a reason and
timestamp; corrections are compensating entries, never edits. This is the demo
centerpiece.

**Frozen scope is authoritative — see `docs/scope.md`.** When asked to add a
feature, default to the out-of-scope section rather than building it. Hard "no"s:
no real payment processing/settlement (checkout records a method + shows static
instructions only; orders end as `PENDING`), no courier/GPS integration
("Lalamove" is a UI label), no email/SMS, no image upload (placeholder URLs
only), no automated test suite (manual verification only).

## Tech stack

- **Next.js 16.3.4** (App Router) + **React 19.2**. See the auto-generated block
  at the top: this Next.js has breaking changes vs. common training data — read
  `node_modules/next/dist/docs/` before writing routes/layouts/actions/config.
- **TypeScript 5** strict. Path alias `@/*` → project root.
- **NextAuth v5 beta** — Credentials + `@auth/prisma-adapter`, JWT sessions.
- **Prisma 5** over **PostgreSQL on Supabase**.
- **Tailwind CSS v4**. shadcn/ui is intended but not yet installed.
- **bcryptjs** (hashing), **zod** (validation).
- Env: **Windows / PowerShell** — use `;` not `&&`, `$env:VAR` not `%VAR%`.
- Package manager: **npm**.

## Non-negotiable rules

- **Money is Int centavos**, never float (₱299.00 → `29900`). Convert to pesos
  only at display time.
- **Stock changes always go through a new `StockMovement`** — never overwrite a
  count. Never edit/delete a ledger row; correct with a compensating movement.
- **Products/variants are soft-deleted** (`active=false`), never hard-deleted —
  orders reference them.
- **Instantiate `PrismaClient` only via `lib/prisma.ts`** — a stray
  `new PrismaClient()` causes "Too many connections".
- Prices/stock live on `ProductVariant`, not `Product`. `Order.totalCentavos`
  and `OrderItem.priceAtTime` are stored (not recalculated) so history is stable.

## Prisma / Supabase (biggest time sink)

Two DB connection strings, both required and different (see `.env.example`):

- `DATABASE_URL` — pooled, port 6543, `?pgbouncer=true`. App runtime.
- `DIRECT_URL` — direct, port 5432. Migrations only (they can't run through the
  pooler).

Set both locally (`.env.local`) and in Vercel for all environments.

## Commands

- Dev server: `npm run dev` (long-running — don't launch it in a blocking shell
  call; ask the user to run it).
- Lint: `npm run lint`. Typecheck: `npx tsc --noEmit`.
- Prisma: `npx prisma migrate dev --name <slug>`, `npx prisma generate`,
  `npx prisma db seed`.

## Known issues / current gaps (roughly end of Week 1)

1. **`build` script must become `prisma generate && next build`** for Vercel
   (cached Prisma client goes stale otherwise). Current `postinstall` runs a
   leftover `prisma skills sync` — the `@prisma/composer` skill files in
   `.agents/.claude/.cursor/.devin` are NOT used by this project (standard
   Prisma, not Composer). Ignore them.
2. **No `prisma/seed.ts` and no `prisma/migrations/`** yet — the seed (~50
   products) is the de-facto backup on Supabase's free tier; commit it.
3. **`app/page.tsx` is a ~1200-line `"use client"` monolith** holding every
   screen with hardcoded `PRODUCTS`/`ORDERS` arrays. Nothing reads the DB yet.
   When wiring real data, decompose into real routes/components; reuse the brand
   palette and `Btn`/`Card`/`Tag`/`FieldInput` primitives defined there.
4. **No `/login` or `/admin` routes** — `auth.config.ts` points at `/login`
   (missing) and defers role checks to pages; a CUSTOMER is not yet actually
   rejected from `/admin`, which the scope requires.
5. **No keep-alive cron** — Supabase pauses free projects after ~7 idle days.

## Repo conventions

- Commits: present tense, one logical change ("add stock movement model").
- Branches: `feat/`, `fix/`, `docs/`, `chore/`. `main` is protected; work via PRs.
- Everything lives in the repo — docs in `docs/`, diagrams (editable source +
  export) in `docs/diagrams/`. Don't commit `.env.local`.
- Read `docs/` before guessing; it's thorough and authoritative. If code and a
  doc disagree, update the doc (schema wins for the data model).
