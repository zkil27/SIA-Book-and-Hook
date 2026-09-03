# Change Log

Every change an AI agent makes to this repository is recorded here, per the
"MANDATORY: document every change" rule in `AGENTS.md`. Newest entries on top.

Each entry follows: **Date — summary**, then What / Why / Impact.

---

## 2026-09-03 — Add universal code-quality verification gate (verify + footgun scan + pre-commit)

**What:** Added a tool-agnostic enforcement layer so the project's written
non-negotiables are checked mechanically, not just documented.
- `scripts/check-footguns.ts` — pure-Node static scanner (no deps, no DB). Flags:
  stray `new PrismaClient()` outside `lib/prisma.ts`; float/`parseFloat` money
  math; hard-delete of `product`/`productVariant`; any edit/delete of a
  `StockMovement` row. Exits non-zero on a hit; inline `// footgun-ok: <reason>`
  opts a line out.
- `package.json` scripts: `typecheck` (`tsc --noEmit`), `footguns`, and
  `verify` = `typecheck && lint && footguns`. Also `setup:hooks` and a
  `postinstall` step that self-activates the git hook.
- `githooks/pre-commit` (committed, POSIX sh) runs `npm run verify`; activated
  via `git config core.hooksPath githooks` through `scripts/setup-hooks.mjs`
  (guarded so it never fails an install outside a git repo). No husky.
- `.gitattributes` forces LF on `githooks/*` and `*.sh` so the hook doesn't
  break on Linux/CI with a CRLF interpreter error.
- Aligned the existing Kiro `PostFileSave` hook to run `npm run verify` (was
  bare `tsc --noEmit`), so the editor convenience layer reuses the same logic.
- Updated `AGENTS.md` with a "Verification gate" section and command list.

**Fixes made to reach a green gate (pre-existing issues the gate surfaced):**
- `eslint.config.mjs` now ignores `prototype_src/**`, `imports/**`,
  `public/imports/**` (legacy prototype + generated Figma assets; already out of
  tsconfig scope).
- `app/StoreApp.tsx`: added missing React `key` props (STEP_ICONS, STATUS_ICONS,
  order-details tuples), removed a duplicate unused `stockColor`, dropped an
  unused `idx` param, escaped an apostrophe.
- `auth.ts`: replaced an `as any` cast on `session.user.role` with a precise
  inline type (no behavior change).
- `prisma/seed.ts`: annotated the intentional wipe-and-reseed deletes with
  `// footgun-ok: seed reset` (option 2 — explicit exceptions over blanket
  exemption).

**Why:** Team asked whether skills/AGENTS.md could make the code better, and to
keep it universal rather than Kiro-only. Mechanical enforcement (a gate every
tool and teammate runs) improves code quality more than additional instruction
prose, and it turns the existing money/ledger/soft-delete/Prisma-singleton rules
into checks that actually block violations.

**Impact:** Run `npm run verify` before committing; it also runs automatically on
commit via the pre-commit hook (bypass with `git commit --no-verify`, discouraged
— CI still runs it). New rules go in `scripts/check-footguns.ts`. `npm run verify`
is currently green: typecheck clean, lint 0 errors (4 non-blocking `<img>`
warnings remain), footguns clean. No dependencies added; scope unchanged (no test
framework).

## 2026-09-03 — Add standalone dev verification scripts (smoke / ledger / data / stress)

**What:** Added a `scripts/` folder of hand-run operational checks (run via
`tsx`, no new dependencies) plus `npm` shortcuts. These are NOT an automated
test suite — the scope (`docs/scope.md`) excludes one — but standalone dev tools
in the same category as `prisma/seed.ts`. Files:
- `scripts/_report.ts` — shared `Report` helper (pass/fail/warn tally, peso
  formatter, non-zero exit on failure). Documents why these scripts use their
  own `PrismaClient` rather than the `server-only` `@/lib/prisma` singleton.
- `scripts/smoke.ts` — DB reachability, per-model row counts, and seed-health
  signals (warns when the DB looks empty / under-seeded vs the ~50-product target).
- `scripts/check-ledger.ts` — StockMovement invariants: no negative computed
  stock, no zero-quantity or reason-less movements, no orphaned rows. Also prints
  a movements-by-reason breakdown and on-hand inventory value.
- `scripts/check-data.ts` — money is non-negative integer centavos, stored
  `Order.totalCentavos` matches the sum of its items, `priceAtTime` is captured,
  active products have a variant, SKUs are non-empty, users have a hash/role and
  at least one ADMIN exists.
- `scripts/stress-connections.ts` — concurrent read-query load generator through
  one client; reports p50/p95/max latency and flags "Too many connections" /
  pool-exhaustion errors (the Supabase free-tier gotcha). Args: `[total] [conc]`.

`package.json` scripts added: `smoke`, `check:ledger`, `check:data`, `check:all`,
`stress`.

**Why:** Team asked for useful test-like scripts (smoke/stress/etc.) for
development. Framed as operational verification rather than a graded test suite
so it respects the frozen "manual verification only" scope while still guarding
the load-bearing invariants (the stock ledger above all).

**Impact:** All scripts are read-only against the DB (stress only reads) and safe
to run anytime after seeding, e.g. `npm run check:all` or `npm run stress -- 500 50`.
Each exits non-zero on failure, so they're usable from hooks or CI later. No app
code, schema, or dependency changes; `tsx` was already a devDependency. `scripts/`
is covered by `tsconfig` `**/*.ts` — `npx tsc --noEmit` passes. Scope unchanged
(no test framework added).

## 2026-09-03 — Replace admin inventory Low/Out toggle with real filters

**What:** Reworked the admin Inventory filter bar in `app/StoreApp.tsx`. The
single "Low / Out" boolean toggle is gone. In its place:
- A **category** dropdown (built from the distinct categories present in the
  inventory data, sorted, with an "All categories" default).
- A **stock-status** segmented control (All / In stock / Low / Out) whose dots
  reuse the same emerald/amber/red semantics as the table's status column, so
  the control visually mirrors the data it filters.
- A live "Showing X of Y" count, and a "Clear filters" link that appears only
  when a search term, category, or status filter is active.

Search, category, and status now compose (all three apply together). The
empty-state row copy was updated to point the user at clearing filters.

**Why:** Follow-up request — the previous filter (low/out only) was too narrow
to be useful for an admin scanning ~50 products across several categories.

**Impact:** Client-side only; no DB, schema, or dependency changes. Reuses the
brand palette and existing `FieldInput` primitive; adds a native `<select>` and
a segmented control (no new dependencies). `npx tsc --noEmit` passes; ESLint
reports only pre-existing issues unrelated to these edits. Replaces the
`lowStockOnly` state added in the prior entry with `invCategory` + `invStatus`.

## 2026-09-03 — Wire up storefront and admin product search + filter

**What:** Made the previously decorative search boxes and Filter button
functional in `app/StoreApp.tsx` (the prototype UI):
- **Storefront (`ClientView`)** — added a `search` state, bound the header
  search field's `value`/`onChange`, and combined it with the existing category
  filter so the product grid now filters by name or category substring (case-
  insensitive). The empty-state message now reflects a no-match search vs. an
  empty category.
- **Admin inventory (`AdminView`)** — added `invSearch` and `lowStockOnly`
  state, bound the "Search products…" field, and turned the inert "Filter"
  button into a toggle that limits the table to Low / Out-of-stock items. The
  inventory table renders the derived `filteredInventory` list and shows an
  empty-state row when nothing matches.

**Why:** User asked to "make the filter and search work" — both inputs rendered
but were `readOnly` with no state wired, and the admin Filter button did nothing.

**Impact:** Client-side only, still operating on the props-supplied product data
(no DB, schema, or dependency changes). `npx tsc --noEmit` passes; `npm run lint`
shows only pre-existing warnings/errors unrelated to these edits. No new
commands or migrations. Behavior is additive — existing category filtering is
unchanged.

## 2026-09-03 — Replace boilerplate README with project README

**What:** Rewrote `README.md`, which was still the stock `create-next-app`
boilerplate, into a Hook & Box project README: product summary, the stock
ledger, tech stack, getting-started (including the dual Supabase
`DATABASE_URL`/`DIRECT_URL` setup and `.env.local`), a commands table, the
money/stock/soft-delete/Prisma-singleton conventions, pointers to the
authoritative `docs/`, and the installed agent skills.

**Why:** The default README described none of this project; a real README helps
teammates and the panel get oriented and run the app correctly.

**Impact:** Documentation only; no code, schema, or dependencies changed.
Commands and env-var guidance mirror `package.json`, `.env.example`, and the
steering docs.

## 2026-09-03 — Install universal agent skills (frontend-design + hookandbox-stack)

**What:** Installed two workspace-scoped Agent Skills, each placed in all five
agent skill directories so they work across every AI tool the repo supports
(`.agents/`, `.claude/`, `.cursor/`, `.devin/`, and a newly created `.kiro/`):
- `frontend-design` — the official Anthropic skill (Apache 2.0; `SKILL.md` +
  `LICENSE.txt`) for distinctive, intentional UI that avoids generic "AI slop".
  Fetched verbatim from `github.com/anthropics/skills`.
- `hookandbox-stack` — a project-tailored skill authored from this repo's own
  files (`prisma/schema.prisma`, `lib/prisma.ts`, `auth.ts`, `auth.config.ts`,
  `.env.example`, `package.json`) and steering docs. Encodes the money-as-centavos,
  append-only StockMovement ledger, soft-delete, Prisma singleton, Next.js 16
  App Router, NextAuth v5 role-gating, and Supabase dual-connection-string rules.

**Why:** The team wanted installable skills that fit the stack and goal, plus a
UI/UX design skill — usable by any agent, not just Kiro, and scoped to this
project only.

**Impact:** New `.kiro/skills/` directory added. No application code, schema,
or dependencies changed — these are agent-guidance files. Skills auto-activate
by description/trigger when relevant work comes up. The `frontend-design` skill
carries its upstream Apache 2.0 `LICENSE.txt`; keep it alongside the `SKILL.md`.
Note: the pre-existing `prisma-composer` skill folders remain unused leftovers
(this project uses standard Prisma, not `@prisma/composer`).

## 2026-09-03 — Add hard rule requiring all changes to be documented

**What:** Added a "MANDATORY: document every change" section near the top of
`AGENTS.md`, reinforced it as a bullet in the "Non-negotiable rules" list, and
created this `docs/changelog.md` file as the required change log.

**Why:** The team wants a hard, enforceable rule so that no AI-made edit ever
ships undocumented — keeping `docs/` trustworthy for the prof check and defense.

**Impact:** From now on, every code/config/schema/dependency/script change must
add an entry here and update any affected topic doc (`data-model.md`,
`scope.md`, `deployment.md`, `project-overview.md`) in the same turn. A change
is not complete until its documentation exists.

## 2026-09-03 — Add plain-language project overview

**What:** Created `docs/project-overview.md`, a beginner-friendly guide to the
whole project (product summary, the stock ledger, the seven entities, common
prof questions, out-of-scope items, tools, repo tour, demo script, glossary).

**Why:** So a team member who isn't strong in coding can confidently explain and
defend the project during the professor's check.

**Impact:** New documentation only; no code changed.
