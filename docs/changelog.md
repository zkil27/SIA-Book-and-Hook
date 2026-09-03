# Change Log

Every change an AI agent makes to this repository is recorded here, per the
"MANDATORY: document every change" rule in `AGENTS.md`. Newest entries on top.

Each entry follows: **Date — summary**, then What / Why / Impact.

---

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
