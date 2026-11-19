# Data Model

Written for the documentator and anyone who doesn't read TypeScript. The
authoritative version is `prisma/schema.prisma` — if the two ever disagree, the
schema wins and this file needs updating.

The ERD (`docs/diagrams/erd.mmd`, Mermaid) is derived from that schema. There
is no ERD generator wired into `prisma generate` yet, so update the Mermaid file
by hand in the same commit as any schema change.

---

## The nine entities

### User
A person with an account. The `role` field is an enum — `ADMIN`, `PACKER`,
`DRIVER` or `CUSTOMER` — and it is the only thing separating staff from a
shopper, and one staff job from another: packers and drivers get their own
phone screens under `/staff` and cannot open the admin (`lib/roles.ts`). Passwords are
stored hashed, never in plain text. `phone`, `address` and `barangay` are the
customer's saved delivery details: optional, one set per account, used to prefill
checkout and editable on `/account`.

### Category
A grouping of products, e.g. "Fish", "Shellfish", "Crustaceans". A product
belongs to one category; a category has many products. Flat — there are no
sub-categories.

### Product
A sellable item as a customer thinks of it: "Bangus (Milkfish)". It carries the
name, description, and image (`imageUrl`, a static path under `/public` such as
`/products/bangus.jpg` — there are no uploads), and belongs to a category. **It
does not carry a price or a stock count** — those live on the variant, because
different cuts and weights can cost different amounts and certainly have
different stock. `active=false` archives it (soft delete).

### ProductVariant
A specific purchasable version of a product: "Bangus, Whole, 1kg". This is where
`sku`, `price`, and `stock` live. A product has one or more variants; a variant
belongs to exactly one product. A product with no meaningful options still gets a
single default variant, so the rest of the system only ever deals with variants.

**Price is an integer in centavos.** ₱299.00 is stored as `29900`. This avoids
the rounding errors that floating-point numbers produce with money, which show up
as totals that are off by a centavo — usually during a demo.

A variant also has its own `active` flag, so one size can be taken off sale
without archiving the whole product, and `priceUpdatedAt`, the time of the last
price change (the storefront flags prices changed "today").

### Order
A customer's purchase, recording who ordered, when, the status, and the total.
The total is stored on the order rather than recalculated, because prices change
and a historical order must reflect what was actually charged.

An order also stores:
- `orderNumber` — an auto-increment number shown to people as **HB-0005**. The
  internal `id` stays a cuid; customers track orders by the readable code.
- `paymentMethod` — `GCASH` or `COD`. Recorded only; nothing is captured or
  settled (scope).
- Delivery details — `deliveryName`, `deliveryPhone`, `deliveryAddress`,
  `deliveryBarangay`, `deliverySlot`.
- `deliveryFeeCentavos` — the fee charged (₱50, or ₱0 when items reach ₱500).
  `totalCentavos` = items at `priceAtTime` + this fee.
- `deliveryDate` — the Manila calendar day of the slot (a `DATE`). Set at
  checkout: ordered before 9 PM → next morning, otherwise the day after, and
  never a Sunday. Each slot takes at most `SLOT_CAPACITY` (12) non-cancelled
  orders a day: one truck run.
- `tripId`, `stopIndex`, `loadedAt` — the delivery trip carrying it, its stop
  number on that trip's route, and when it was ticked onto the truck.
- `handoffPin` — 4 random digits shown **only** to the customer (on `/track`
  and `/account` while the order is packed or on the truck). The driver types
  it at the door to finish the stop. Staff screens never read it out.
- `pinAttempts` — wrong PIN entries. At 5 the PIN locks and the driver must
  finish with a logged reason instead.

Statuses run `PENDING → CONFIRMED → PACKED → READY (on the truck) → COMPLETED`,
or `CANCELLED` from any status before `READY`. The office advances only the
first two steps; `PACKED → READY` happens when the driver starts the trip, and
`READY → COMPLETED` at the door (PIN or logged reason) or by an office override
with a written reason.

### Trip
One delivery run on the store's own vehicle: a delivery day, a slot, a vehicle
label ("Truck 1", a label only, no fleet records), a driver, and its orders as
numbered stops. `tripNumber` is shown as **T-012**. Status runs
`PLANNED` (drafted, being loaded) → `OUT` (left the stall) → `RETURNED` (back,
cash not yet counted) → `REMITTED` (the office confirmed the cash). The remit
fields record the cash-on-delivery money the driver handed in
(`cashRemittedCentavos`), who counted it and a note when it differs from the
expected total. That is a handover record between staff, not payment
processing. A planned trip that never left may be scrapped (deleted); a trip
that left stays as part of the delivery record.

### OrderItem
One line on an order: which variant, how many, and the price **at the time of
ordering**. That last part is why the price is copied here instead of read from
the variant — if the product's price changes next month, last month's order must
not change with it.

### StockMovement
The stock ledger. Every change in stock writes a row here: the variant affected,
the quantity change (positive for stock coming in, negative for going out), the
type of movement, a reason, and optionally the order that caused it.

**It is append-only.** Rows are never edited or deleted. A mistake is corrected
by writing a compensating movement, exactly as in accounting. This is what makes
the admin stock history screen possible, and it means the question "why is stock
at 3 when we received 10" always has an answer in the data.

Each movement can link to the `order` that caused it (`orderId`) and to the
staff member who recorded it (`actorId`). The app writes movements for: online
sales (when an order is placed), cancellations (stock back on the shelf), walk-in
sales, restocks, spoilage/damage, morning counts (the counted-minus-system
difference) and undos/corrections ("Undo of MV-…", "Correction of MV-…").

### OrderStatusEvent
The order's timeline: one row per status change, with `fromStatus`, `toStatus`,
an optional `note` (e.g. the cancellation reason, `On the truck · T-012 stop 3
of 7`, `PIN verified · COD ₱540 collected`, `No PIN: … · received by …`,
`Office: …`) and who made the change (`actorId`). Like the stock ledger it is **append-only** — undoing a status
change writes a new event with the note "Undo", it never rewrites history.
`npm run footguns` fails the build if code updates or deletes either table.

---

## How they connect

```
Category  1 ──< many  Product
Product   1 ──< many  ProductVariant
User      1 ──< many  Order
Order     1 ──< many  OrderItem
ProductVariant 1 ──< many  OrderItem
ProductVariant 1 ──< many  StockMovement
Order     1 ──< many  StockMovement   (optional — a movement may have no order)
Order     1 ──< many  OrderStatusEvent
User      1 ──< many  StockMovement      (optional — the staff member who recorded it)
User      1 ──< many  OrderStatusEvent   (optional — who changed the status)
Trip      1 ──< many  Order              (optional — the trip carrying it)
User      1 ──< many  Trip               (optional — the driver)
User      1 ──< many  Trip               (optional — who confirmed the cash)
```

The diagram source is `docs/diagrams/erd.mmd` (Mermaid), derived from
`prisma/schema.prisma`.

Read `1 ──< many` as "one of these has many of those."

---

## How stock is read

Stock is still never stored. It is computed from the ledger, but in the
database rather than in the app (`lib/stock-sql.ts`, since 2026-11-05):

- **Current stock** = `SUM(quantity)` of a variant's movements (a `GROUP BY`).
- **Age of the oldest stock on hand** (drives the 7-day "To sale" flag) uses
  first-in, first-out lots: sales use up the oldest deliveries first, so what's
  left is the newest deliveries adding up to the current stock. A window query
  finds the oldest delivery still partly on hand.
- **Ledger running balance** = `SUM(quantity) OVER (PARTITION BY variant ORDER
  BY time)`, computed over full history before the page's date filter.

`lib/ledger.ts` keeps the plain JavaScript versions as the reference, and
`npm run check:ledger` compares both for every variant.

## Indexes

Postgres does not index foreign keys automatically, and Prisma doesn't add
them either. Beyond the unique keys, the schema indexes:

| Table | Index | Serves |
|---|---|---|
| StockMovement | `(variantId, createdAt)` | A variant's history, stock sums, ledger filter |
| StockMovement | `(orderId)` | An order's movements (cancelling returns exactly what it holds) |
| StockMovement | `(variantId, quantity)` | Covering index: stock = `SUM(quantity)` per variant read from the index alone (2026-11-07) |
| Order | `(status, createdAt)` | Admin order tabs, pending counts, dashboard date ranges |
| Order | `(customerId, createdAt)` | A customer's order history |
| Order | `(createdAt)` | The "All" orders tab and week totals across every status (2026-11-07) |
| OrderItem | `(orderId)`, `(variantId)` | Loading an order's lines; top sellers |
| OrderStatusEvent | `(orderId, createdAt)` | An order's timeline |
| OrderStatusEvent | `(toStatus, createdAt)` | Dashboard "delivered without a PIN" (2026-11-07) |
| Order | `(deliveryDate, deliverySlot, status)` | Slot capacity at checkout, dispatch drafting |
| Order | `(tripId, stopIndex)` | A trip's stops in route order |
| Trip | `(date, slot)`, `(driverId, date)`, `(status)` | Dispatch board, a driver's trips, trips awaiting cash |
| Product | `(categoryId)` | Catalog by category |
| ProductVariant | `(productId)` | A product's variants |

Indexes don't change the entities or relations. (The ERD changed on 2026-11-08 for `Trip`, not for these; the 2026-11-07 speed-pass indexes in migration `20261109000000_perf_indexes` don't change it either, so `docs/diagrams/` needs no regeneration.)

The Prisma client also enables the `relationJoins` preview feature (schema
`generator` block). It changes how nested reads are executed (one SQL
statement with lateral joins when a query passes
`relationLoadStrategy: "join"`), not the data model.

---

## Design decisions worth defending

These are the questions a panel is most likely to ask. Have the answer ready.

**Why separate Product from ProductVariant?**
Because price and stock are properties of a specific cut and weight, not of the
product concept. Flattening them would mean either one price for all sizes, or
duplicating the name and description across every variation.

**Why store money as an integer?**
Floating-point arithmetic cannot represent most decimal fractions exactly, so
sums of prices drift. Storing centavos as whole numbers makes every arithmetic
operation exact. Conversion to a readable peso amount happens only at display time.

**Why a stock ledger instead of just a stock number?**
A single number tells you what stock is, never how it got there. The ledger gives
an audit trail — the difference between a system that tracks inventory and one
that merely displays it. It also means stock discrepancies are diagnosable rather
than mysterious, which is the client's actual pain point.

**Why copy the price onto OrderItem?**
So that historical orders stay historically accurate when prices change.

**Why does a delivery address live on both User and Order?**
They mean different things. `User.address` is where the customer usually wants
delivery, and it can change at any time. `Order.deliveryAddress` is where that
order actually went, so it is a snapshot, for the same reason as `priceAtTime`.
If orders read from the account, moving house would rewrite delivery history.

**Why are products archived rather than deleted?**
Orders reference variants. Deleting a product would orphan or destroy order
history. Archiving hides it from the storefront while preserving the record.
