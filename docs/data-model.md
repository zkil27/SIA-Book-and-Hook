# Data Model

Written for the documentator and anyone who doesn't read TypeScript. The
authoritative version is `prisma/schema.prisma` — if the two ever disagree, the
schema wins and this file needs updating.

The ERD is generated from that schema, so it never drifts. Regenerate with
`npx prisma generate` and commit the output in the same commit as the schema
change.

---

## The seven entities

### User
A person with an account. The `role` field is an enum — `ADMIN` or `CUSTOMER` —
and it is the only thing separating a staff member from a shopper. Passwords are
stored hashed, never in plain text.

### Category
A grouping of products, e.g. "Fish", "Shellfish", "Crustaceans". A product
belongs to one category; a category has many products. Flat — there are no
sub-categories.

### Product
A sellable item as a customer thinks of it: "Bangus (Milkfish)". It carries the
name, description, and image, and belongs to a category. **It does not carry a
price or a stock count** — those live on the variant, because different cuts and
weights can cost different amounts and certainly have different stock.

### ProductVariant
A specific purchasable version of a product: "Bangus, Whole, 1kg". This is where
`sku`, `price`, and `stock` live. A product has one or more variants; a variant
belongs to exactly one product. A product with no meaningful options still gets a
single default variant, so the rest of the system only ever deals with variants.

**Price is an integer in centavos.** ₱299.00 is stored as `29900`. This avoids
the rounding errors that floating-point numbers produce with money, which show up
as totals that are off by a centavo — usually during a demo.

### Order
A customer's purchase, recording who ordered, when, the status, and the total.
The total is stored on the order rather than recalculated, because prices change
and a historical order must reflect what was actually charged.

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
```

Read `1 ──< many` as "one of these has many of those."

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

**Why are products archived rather than deleted?**
Orders reference variants. Deleting a product would orphan or destroy order
history. Archiving hides it from the storefront while preserving the record.
