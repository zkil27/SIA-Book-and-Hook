# 14-Day Plan — to September 5

Four lanes running in parallel. Nobody is blocked on anybody for more than a day.

| Lane | Owner |
|---|---|
| Backend: schema, auth, data access | Lead |
| Frontend: tables, forms, components | Part-time programmer/designer |
| Design: wireframes, visual direction | UI/UX |
| Documentation: SRS, diagrams | Documentator |

---

## Week 1 — scope and skeleton

### Days 1–2 — Freeze the scope
- **Lead:** Pick the client option in `docs/scope.md`. Fill Section 1. Freeze the
  feature list. The out-of-scope section is the deliverable that matters.
- **Lead:** Create the repo, push these docs, protect `main`.
- **Documentator:** Blocked until scope is frozen — read `docs/srs-outline.md`
  and prepare the document template in the meantime.
- **UI/UX:** Collect visual references for the chosen client type.

### Days 2–3 — Data model
- **Lead:** Data model on paper first, then into `prisma/schema.prisma`. Seven
  models. Run the first migration against Supabase.
- **Documentator:** SRS Sections 1–2 from the scope doc.
- **UI/UX:** Wireframe the five screens: product list, product detail, cart,
  admin product list, admin product form.

### Days 3–4 — Deploy the empty app
- **Lead:** Scaffold Next.js, wire Prisma, deploy to Vercel. **Stop when a live
  URL loads.** Deployment surprises cost an hour today and a weekend on Sept 4.
- **Lead:** Both connection strings into Vercel. Keep-alive cron in place.
- **Part-timer:** Tailwind + shadcn/ui installed; add the primitives the admin
  panel needs (table, form, dialog, toast, select, input).

### Days 5–7 — Real data on screen
- **Lead:** `prisma/seed.ts` — ~50 products, demo accounts, a few past orders
  with matching stock movements. Run it against Supabase.
- **Part-timer:** Storefront product listing page reading real rows.
- **Documentator:** Generate the first ERD from the schema. Start SRS Section 3.
- **UI/UX:** Wireframes done and committed to `docs/design/`.

**End of Week 1 gate:** the live URL shows ~50 seeded products from the real
database. If this isn't true on Day 7, cut features from Week 2, not this.

---

## Week 2 — one vertical slice

### Days 8–9 — Auth and roles
- **Lead:** NextAuth credentials, `User.role`, middleware gating `(admin)`.
  Log in as a customer and confirm `/admin` rejects you.
- **Part-timer:** Admin layout shell, navigation, the product table.

### Days 10–11 — Admin CRUD
- **Lead:** Server actions for product create/update, variant handling, stock
  adjustment writing to `StockMovement`.
- **Part-timer:** Product form with validation. Toasts on success and failure.

### Days 12–13 — Storefront slice and stock history
- **Part-timer:** Product detail page, client-side cart.
- **Lead:** Stock history screen — the ledger view. This is the screen that makes
  the project look different from every other group's.
- **Documentator:** Use-case diagram, level-0 and level-1 DFDs. Regenerate the
  ERD against the final schema.

### September 4 — Rehearse
- Full run-through from the **live URL**, not localhost. Follow
  `docs/demo-runbook.md` start to finish.
- Fix only what breaks the demo. Do not start new features. Do not refactor.
- Confirm the docs folder is complete and committed.

### September 5 — Progress check
What you're showing: a live URL, a browsable seeded shop, an admin login that
creates and edits products, a stock history screen with real movements, and a
docs folder containing scope, ERD, and SRS draft.

---

## Cut list

If you're behind, cut in this order. Cutting early and deliberately is a better
look than arriving with six half-finished features.

1. Search
2. Cart
3. Order list in admin
4. Category filtering
5. Product archive

**Never cut:** the live deployment, seeded data, admin auth, product CRUD, or
the stock history screen. Those five are the demo.
