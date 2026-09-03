# SRS Outline — for the documentator

Follow your professor's required format if one was given; that overrides this.
Otherwise this is a standard IEEE-830-shaped structure.

The point of this file is that **you should almost never need to ask the
developers a question.** Each section below names where its content comes from.

---

## Section 1 — Introduction
*Source: `docs/scope.md` Section 1*

- **1.1 Purpose** — what the system is for, who this document is for.
- **1.2 Scope** — the client's situation and what the system does about it. Lift
  from the client profile and pain points.
- **1.3 Definitions and acronyms** — SKU, variant, stock movement, centavos,
  ERD, DFD, CRUD, role. Define anything the panel might ask you to define.
- **1.4 References** — this repo, the deployed URL, any standards used.
- **1.5 Overview** — one paragraph on how the rest of the document is arranged.

## Section 2 — Overall description
*Source: `docs/scope.md` Sections 2 and 3, `docs/data-model.md`*

- **2.1 Product perspective** — a standalone web application replacing a manual,
  notebook-and-chat process. Include a high-level block diagram.
- **2.2 Product functions** — the in-scope feature list, summarized in prose.
- **2.3 User classes** — Customer and Admin. Take their descriptions from the
  scope doc's "Users of the system".
- **2.4 Operating environment** — modern browser, deployed on Vercel, PostgreSQL
  on Supabase, Next.js and TypeScript. Details in `docs/deployment.md`.
- **2.5 Constraints** — 14-day timeline, free-tier hosting, no real payment
  processing, PHP currency only.
- **2.6 Assumptions and dependencies** — from `docs/scope.md` Section 4.

## Section 3 — Specific requirements
*Source: `docs/scope.md` Section 2 — the "Done means" column is your acceptance criteria*

Number every requirement so it can be referenced in a defense.

- **3.1 Functional requirements** — one entry per feature:
  ```
  FR-01  Product listing
         The system shall display all active products, filterable by category.
         Actors: Customer
         Acceptance: seeded products render from the database with a working filter.
  ```
- **3.2 External interface requirements** — screens (use the wireframes in
  `docs/design/`), and the database interface.
- **3.3 Non-functional requirements** — role-based access control, hashed
  passwords, no plain-text credentials, monetary values stored as integers to
  guarantee arithmetic exactness, append-only audit trail for stock.
- **3.4 Data requirements** — the ERD, plus entity descriptions taken from
  `docs/data-model.md`. That file is written in plain language for exactly this.

---

## Diagrams you need

| Diagram | How to produce it | Where it goes |
|---|---|---|
| ERD | Generated from `prisma/schema.prisma` — do not draw it by hand | `docs/diagrams/erd.*` |
| Use-case | Two actors (Customer, Admin), one use case per in-scope feature | `docs/diagrams/use-case.*` |
| DFD level 0 | Context diagram: the two actors, the system as one process, the datastore | `docs/diagrams/dfd-level-0.*` |
| DFD level 1 | Decompose into: Manage Catalog, Manage Stock, Browse & Order, Authenticate | `docs/diagrams/dfd-level-1.*` |

**Commit the editable source, not just the exported image.** A PNG you can't edit
at 11pm the night before submission is not a deliverable, it's a souvenir.

**Regenerate the ERD whenever the schema changes.** Ask the lead to ping you on
any schema commit. An ERD that doesn't match the database is the single most
common thing panels catch.

## Working notes

- Write Sections 1–2 as soon as the scope is frozen. Don't wait for code —
  nothing in them depends on implementation.
- Section 3 tracks the build, so draft it from the scope doc and correct it in
  Week 2 as features land.
- If something in the code contradicts this document, the document is wrong. Ask,
  then update it.
- Everything you produce goes in the repo. Nothing lives only on your laptop.
