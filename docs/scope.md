# Scope Document

**Status:** FROZEN
**Owner:** Project lead. Changes require agreement from the whole team.

---

## 1. Client profile

**Business name:** Hook and Box

**What they sell:** Fresh seafood — fish, shellfish, crustaceans, squid, and
prepared/marinated seafood ready for cooking.

**Size and setup:** A single physical store with 2 branches and ~8 staff (owner,
3 fishmongers/counter staff, 2 delivery riders, 1 inventory clerk, 1 admin
assistant). Operating for 4 years with a growing customer base within a local
delivery radius. Has a Facebook page used for orders and price announcements.

**How they operate today:**
- Orders come in through Facebook Messenger and walk-ins.
- Stock is tracked on a whiteboard — the clerk counts stock every morning and
  adjusts after each sale.
- Prices change with market fluctuations and seasonal catches; updates are
  announced through social media posts and stories.
- Order history is logged manually in a notebook.

**Pain points:**
1. No single source of truth for stock levels; overselling happens when Messenger
   orders conflict with walk-in sales.
2. Price updates require editing multiple posts/stories; customers frequently ask
   "is this still available?" or "how much is bangus today?"
3. Order history is lost once the notebook page is full — no way to identify
   repeat customers or popular items.
4. No record of why stock changed — spoilage, miscounts, and delivery shortages
   are invisible.
5. The owner cannot see daily/weekly sales at a glance without manually tallying
   receipts.

**Users of the system:**
- **Customer** — browses the catalog, views product detail with real-time stock
  and price-per-variant, sees their own order history.
- **Admin / staff** — manages products and variants, adjusts stock with reasons,
  reviews orders and the stock movement ledger, sees a basic dashboard summary.

---

## 2. In scope

### Storefront `(shop)`

| Feature | Done means |
|---|---|
| Product listing | Seeded products render from the database, paginated or scrollable, with category filter. |
| Category browsing | Selecting a category narrows the list; URL reflects the filter. |
| Product detail | Single product page showing variants (cut, weight), price, and stock availability. |
| Search | Text match on product name. Basic. Not fuzzy, not ranked. |
| Customer auth | Register and log in with credentials; session persists. |
| Customer order history | Logged-in customer can view their own past orders and statuses. |

### Admin panel `(admin)`

| Feature | Done means |
|---|---|
| Role-gated access | A customer account hitting any `/admin` route is rejected. Verified by actually logging in as one. |
| Product list | Table of all products with search and category filter. |
| Product create / edit | Form creates and updates a product and its variants, including price in centavos and SKU. |
| Product archive | Soft-delete / deactivate. Products are never hard-deleted — orders reference them. |
| Category management | Admin can create and rename categories. |
| Stock adjustment | Admin can adjust variant stock with a reason; writes a `StockMovement` row. |
| Stock history | Read-only ledger view per variant showing every movement, newest first. |
| Order list & status update | Table of orders with status and total. Admin can update status (pending → confirmed → ready → completed / cancelled). |
| Dashboard summary | Today's order count, total revenue, and low-stock alerts on the /admin landing page. |

### Documentation deliverables

- This scope document.
- ERD, generated from `prisma/schema.prisma`.
- Use-case diagram.
- Level-0 and Level-1 data flow diagrams.
- SRS sections 1–3 (see `docs/srs-outline.md`).

---

## 3. Out of scope

This section exists so that on Day 9, when someone suggests adding a feature,
the answer is a link rather than an argument. **Nothing here gets built before
September 5, and most of it never gets built at all.**

**Never in this project:**
- Real payment processing. No card capture, no GCash/Maya/Stripe/PayPal
  integration, no stored payment credentials. Orders end at a record with status
  `PENDING` — payment is handled outside the system.
- Real shipping, courier APIs, or delivery tracking.
- Email or SMS sending of any kind — no order confirmations, no password reset
  emails, no notifications.
- Multi-vendor or marketplace functionality. One client, one catalog.
- Any handling of real customer personal data. All data is seeded and fictional.

**Not before September 5** (revisit only after the vertical slice is done):
- Shopping cart & checkout flow. Cart is client-side state until told otherwise.
  There is no checkout that creates an order from the storefront in this phase.
- Product reviews and ratings.
- Recommendations, "related products", or anything resembling a recommender.
- Discount codes, promotions, or dynamic pricing.
- Analytics dashboards, sales charts, revenue reporting (beyond the simple
  dashboard summary).
- Image upload. Seeded products use static or placeholder image URLs.
- Wishlists, saved items, or user profile pages beyond basic account info.
- Mobile app, PWA features, offline support.
- Internationalization or multi-currency. PHP only.
- Automated test suite. Manual verification against the checklist in AGENTS.md.

**Deliberately shallow:**
- Search is a name match, not full-text search.
- Auth is credentials only — no OAuth, no magic links, no 2FA.
- Accessibility follows whatever shadcn/ui provides by default; no audit.
- The dashboard is counts and alerts only — no chart libraries or export features.

---

## 4. Assumptions

- Graders evaluate a live deployed URL, not a local run.
- Seeded data is acceptable as demonstration data.
- The fictional client is not a real business and no real transactions occur.
- One shared Supabase free-tier project serves as both dev and demo database.

---

## 5. Executive summary (for SRS Section 1)

Hook and Box is a small fresh-seafood retailer that currently manages orders and
inventory manually through social media and paper logs, resulting in frequent
overselling, lost order history, and no visibility into stock movements or
business performance. This project delivers a web-based e-commerce platform with
two interfaces: a public-facing product catalog where customers can browse
available seafood by category and view real-time stock and pricing, and a
role-protected admin panel where staff can manage products, process orders, and
track stock movements through an append-only ledger. The system is built with
Next.js (App Router), TypeScript, Prisma ORM over PostgreSQL (Supabase), and
Tailwind CSS with shadcn/ui components, deployed on Vercel. The initial
deliverable focuses on catalog browsing, admin CRUD, order management, and stock
tracking — explicitly excluding payment processing, cart/checkout flows,
notifications, and analytics beyond a basic dashboard summary.

---

## 6. Change log

| Date | Change | Agreed by |
|---|---|---|
| 2026-08-22 | Scope frozen — Hook and Box (fresh seafood) | Lead |
