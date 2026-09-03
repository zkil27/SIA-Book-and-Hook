---
inclusion: fileMatch
fileMatchPattern: ["prisma/**", "**/*.prisma", "lib/prisma.ts", "**/seed.ts"]
---

# Data Model Rules

Authoritative schema: #[[file:prisma/schema.prisma]]
Plain-language reference + rationale: #[[file:docs/data-model.md]]
If schema and docs disagree, the schema wins and the doc must be updated. When
the schema changes, the ERD in `docs/diagrams/` must be regenerated in the same
commit.

## Seven entities

`User` 1─<many `Order` 1─<many `OrderItem`
`Category` 1─<many `Product` 1─<many `ProductVariant` 1─<many (`OrderItem`, `StockMovement`)

- **User** — `role` enum `ADMIN | CUSTOMER` is the only thing separating staff
  from shoppers. `passwordHash` only, never plaintext.
- **Category** — flat, no sub-categories.
- **Product** — customer-facing item. Carries name/description/category. Does
  NOT carry price or stock. `active: Boolean` = soft-delete flag.
- **ProductVariant** — the purchasable unit. Holds `sku` (unique),
  `priceCentavos` (Int), and stock (derived from movements). A product with no
  options still gets one default variant.
- **Order** — stores `totalCentavos` on the row (not recalculated) so historical
  orders stay accurate. `status` enum: PENDING → CONFIRMED → READY → COMPLETED
  (or CANCELLED).
- **OrderItem** — line item; `priceAtTime` copies the price at order time so
  price changes don't rewrite history.
- **StockMovement** — the append-only ledger. `quantity` +/- , `reason` string,
  `createdAt`. NEVER edit or delete a row; correct mistakes with a compensating
  movement.

## Non-negotiable rules

- Money is **Int centavos**, never float.
- Stock changes ALWAYS go through a new `StockMovement`, never by overwriting a
  number. Read current stock by summing movements (or a maintained field kept in
  sync via movements).
- Products/variants are archived (`active=false`), never hard-deleted — orders
  reference them.
- Write schema changes → `npx prisma migrate dev --name <slug>` (uses
  `DIRECT_URL`) → commit the migration.
