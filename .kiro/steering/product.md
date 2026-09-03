---
inclusion: always
---

# Product: Hook & Box

Academic capstone (course code "SIA") for a **fictional** fresh-seafood retailer
in Dasmariñas City, Philippines. It is graded on a **live deployed URL**, not a
local run. No real business, no real transactions — all data is seeded and
fictional.

## What it is

A web store with two interfaces:

- **Storefront** — customers browse a seafood catalog by category, view product
  detail with real-time stock and price-per-variant, build a client-side cart,
  move through a multi-step checkout (order review → delivery info → payment
  method → confirmation), track an order by ID, and see their own order history.
- **Admin panel** — role-gated staff area for product/variant CRUD, category
  management, stock adjustments (writing to an append-only ledger), order status
  updates, and a basic dashboard (counts, alerts, simple hand-built charts).

## The one feature that matters most

The **stock movement ledger** — an append-only audit trail. Every stock change
writes a `StockMovement` row with a reason and timestamp; corrections are
compensating entries, never edits. This is the demo centerpiece, not the
storefront. Treat it as load-bearing.

## Users

- **Customer** — browse, cart, checkout (pick payment method), track order,
  order history.
- **Admin/staff** — manage products/variants/categories, adjust stock with
  reasons, review orders and the stock ledger, view the dashboard.

## Hard scope boundaries (do not build without explicit approval)

- No real payment processing/settlement. Checkout records a chosen method
  (GCash/COD) and shows static instructions only. Orders end as `PENDING`.
- No courier/GPS integration. "Lalamove" in the UI is a label, not an API. The
  order tracker shows internal order status only.
- No email/SMS, no notifications of any kind.
- No image upload — placeholder/static image URLs only.
- No automated test suite — manual verification only.

The frozen scope is the source of truth: #[[file:docs/scope.md]]
When asked to add a feature, default to the out-of-scope section rather than
building it.
