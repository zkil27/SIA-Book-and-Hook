# Change Log

Every change an AI agent makes to this repository is recorded here, per the
"MANDATORY: document every change" rule in `AGENTS.md`. Newest entries on top.

Each entry follows: **Date — summary**, then What / Why / Impact.

---

<<<<<<< HEAD
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

=======
>>>>>>> 7db30a822b5867d2e684fdabf599b861f20e3a29
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
