# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Customers** — households in Dasmariñas City, Cavite, buying fresh seafood for home cooking. They browse by species or dish, pick a cut/weight variant, build a basket, and check out with GCash or Cash on Delivery. Mostly on phones.
- **Staff / admin** — the store's ~8 people (owner, counter fishmongers, inventory clerk, admin assistant). Used on **both** devices equally: a desktop power layout for the owner/admin assistant (catalog, orders, ledger), and a thumb-friendly phone mode for counter staff doing quick stock and order actions during the morning rush.

## Product Purpose

Hook & Box replaces Messenger orders, a whiteboard stock count, and a paper order notebook with one source of truth. Customers see real-time stock and price per variant; staff manage products, orders, and stock through an append-only ledger. Success: no overselling, every stock change explained, and staff finishing daily admin work fast and without confusion.

Academic capstone ("SIA"); the business is fictional and graded on a live deployed URL.

## Positioning

A neighborhood wet-market fishmonger that runs on an auditable stock ledger: every gram in or out has a timestamped reason, and corrections are compensating entries, never edits. The ledger is the demo centerpiece.

## Operating Context

- Catch arrives at dawn (Cavite fish port); stock is counted each morning; prices change with market and season.
- Orders flow Pending → Confirmed → Ready / Out for Delivery → Completed / Delivered, or Cancelled.
- Remaining stock lots are evaluated FIFO; stock 7+ days old is flagged **To Sale** for admin review.
- Delivery is local; "Lalamove" is a UI label only.

## Capabilities and Constraints

- Frozen scope: `docs/scope.md` is authoritative. Admin overhaul delivers every in-scope feature for real (order status updates, product/variant create-edit-archive, category create/rename, stock adjustment with reason, per-variant ledger, dashboard counts and alerts, role-gated `/admin`) plus speed UX that adds no scope (command palette, keyboard shortcuts, bulk actions, undo toasts, an attention inbox).
- Build depth: split the single-file prototype into real App Router routes wired to Prisma/Supabase; remove the prototype view switcher.
- Never: real payment capture, courier/GPS integration, email/SMS, image upload, multi-vendor, automated tests.
- Money is Int centavos; stock changes only via new `StockMovement` rows; products/variants soft-deleted.
- Dashboard charts are hand-built (no charting library), no export or drill-down.
- Stack: Next.js 16 App Router, React 19, TypeScript, NextAuth v5 credentials, Prisma 5, Tailwind v4.

## Brand Commitments

- Name: **Hook & Box** (logo mark in `imports/`). Fresh seafood, Dasmariñas City, Cavite.
- Voice: **English copy, with Filipino only for species and dish names** (Bangus, Hipon, Alimango, Pusit; Sinigang, Inihaw, Ginataan, Kilawin). No Taglish slogans.
- The user wants the whole site to feel **fun and satisfying to use**, with rich micro-animation, while the admin stays intuitive and fast.

## Evidence on Hand

- Seeded fictional catalog (~50 products) in `prisma/seed.ts` and `lib/fallback-catalog.ts`.
- Product imagery: **real free-license photos** to be sourced per species (none in the repo yet; `public/products/` is empty). Record each photo's source and license.
- No real customers, reviews, testimonials, or sales figures exist; demo numbers must come from seeded data, never invented claims.

## Product Principles

1. **Truth over decoration** — stock, price, and order status shown are always the real ledger-derived values.
2. **The ledger is the story** — every stock change is visible, explained, and append-only, in both UI and data.
3. **Fast hands** — the most frequent staff actions (confirm order, adjust stock, find a product) take the fewest steps on both phone and desktop.
4. **Delight with a job** — every animation confirms an action, shows state, or guides the eye; none is decoration alone.

## Accessibility & Inclusion

Respect `prefers-reduced-motion` for all animation; keyboard operability for every admin action; WCAG AA contrast on text and status colors.
