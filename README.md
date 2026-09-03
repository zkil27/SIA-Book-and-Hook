# Hook & Box

Academic capstone (course code "SIA") for a **fictional** fresh-seafood retailer
in Dasmariñas City, Philippines. Graded on a **live deployed URL**, not a local
run. No real business and no real transactions — all data is seeded and
fictional.

The app has two interfaces:

- **Storefront** — browse a seafood catalog by category, view product detail
  with real-time stock and price per variant, build a client-side cart, move
  through a multi-step checkout (review → delivery info → payment method →
  confirmation), track an order by ID, and view order history.
- **Admin panel** — role-gated staff area for product/variant CRUD, category
  management, stock adjustments (written to an append-only ledger), order status
  updates, and a basic dashboard.

The load-bearing feature is the **stock movement ledger**: an append-only audit
trail where every stock change writes a `StockMovement` row with a reason and
timestamp. Corrections are compensating entries, never edits.

## Tech stack

- **Next.js 16.3.4** (App Router) + **React 19.2**
- **TypeScript 5** (strict), path alias `@/*` → project root
- **Prisma 5** over **PostgreSQL on Supabase**
- **NextAuth v5 beta** (Credentials + `@auth/prisma-adapter`, JWT sessions)
- **Tailwind CSS v4**
- **bcryptjs** (password hashing), **zod** (validation)
- Package manager: **npm**. Dev env: **Windows / PowerShell**

## Getting started

Prerequisites: Node.js, npm, and a Supabase Postgres project.

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create `.env.local` from the template and fill in the values:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   Two database URLs are required and different (see `.env.example`):

   - `DATABASE_URL` — pooled connection, port `6543`, `?pgbouncer=true`. Used by
     the app at runtime.
   - `DIRECT_URL` — direct connection, port `5432`. Used by `prisma migrate`
     only; migrations cannot run through the pooler.

   Also set `NEXTAUTH_SECRET` and `NEXTAUTH_URL`.

3. Apply the schema and seed data:

   ```powershell
   npx prisma migrate dev
   npx prisma db seed
   ```

4. Run the dev server:

   ```powershell
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (long-running) |
| `npm run build` | `prisma generate && next build` (Vercel-safe) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check |
| `npx prisma migrate dev --name <slug>` | Create/apply a migration (uses `DIRECT_URL`) |
| `npx prisma generate` | Regenerate the Prisma client |
| `npx prisma db seed` | Seed the database (`tsx prisma/seed.ts`) |

PowerShell note: chain commands with `;` (not `&&`) and reference environment
variables as `$env:VAR`.

## Conventions

- **Money is `Int` centavos**, never a float (₱299.00 → `29900`). Convert to
  pesos only at display time.
- **Stock changes always go through a new `StockMovement`** — never overwrite a
  count, never edit or delete a ledger row.
- **Products/variants are soft-deleted** (`active = false`), never hard-deleted,
  because orders reference them.
- **Instantiate `PrismaClient` only via `lib/prisma.ts`** — a stray
  `new PrismaClient()` causes "Too many connections".
- Commits: present tense, one logical change. Branches: `feat/`, `fix/`,
  `docs/`, `chore/`. `main` is protected; work via PRs.

## Documentation

The `docs/` directory is authoritative — read it before guessing. Every AI-made
change is recorded in `docs/changelog.md` per the rule in `AGENTS.md`.

- `docs/scope.md` — frozen feature scope (source of truth)
- `docs/data-model.md` — entity reference and rationale (schema:
  `prisma/schema.prisma`)
- `docs/deployment.md` — Supabase + Vercel runbook
- `docs/project-overview.md` — plain-language project guide
- `docs/changelog.md` — running change log
- `AGENTS.md` — portable, cross-tool project contract for AI coding agents

## Agent skills

Workspace-scoped Agent Skills live in each tool's skills directory (`.agents/`,
`.claude/`, `.cursor/`, `.devin/`, `.kiro/`): `frontend-design` (distinctive
UI guidance) and `hookandbox-stack` (this project's engineering rules). They
activate automatically when relevant.

## Deploy

Deployed on Vercel. Set both `DATABASE_URL` and `DIRECT_URL` (plus
`NEXTAUTH_SECRET` and `NEXTAUTH_URL`) in the Vercel environment for every
environment. See `docs/deployment.md` for the full runbook.
