# Hook & Box — Project Overview (Plain-Language Guide)

This is the "explain it like I'm not a programmer" guide to our project. If you
get asked to describe the project, defend a decision, or point at where
something lives, the answer is somewhere on this page. Read it once out loud
before the check and you'll be fine.

The deeper technical docs live next to this file (`scope.md`, `data-model.md`,
`deployment.md`, etc.). This page is the map; those are the territory.

---

## 1. What is this project, in one breath?

**Hook & Box is an online store for a made-up fresh-seafood shop in Dasmariñas
City.** It's a school project (course "SIA"). The business is fictional, the
customers are fictional, and no real money ever changes hands. We are graded on
a **live website link**, not on the code running on someone's laptop.

Think of it as two websites sharing one database:

1. **The storefront** — what a customer sees. Browse seafood, see prices and
   how much stock is left, add things to a cart, and "check out."
2. **The admin panel** — what the shop's staff sees. Add or edit products,
   change prices, adjust stock, and look at orders. This part is locked; only
   staff accounts can get in.

### The real-world problem we're solving

The pretend shop currently runs on a whiteboard and a notebook. They take orders
over Facebook Messenger, count stock by hand every morning, and announce price
changes in social media posts. That causes real headaches:

- They sell the same fish twice because Messenger orders and walk-in sales don't
  talk to each other.
- Nobody remembers *why* stock is low — was it a sale, spoilage, or a miscount?
- Old orders vanish once the notebook page fills up.

Our system fixes those by keeping everything in one place with a proper record.

---

## 2. The single most important feature (say this in the demo)

If you remember only one thing, remember the **stock movement ledger**.

Instead of storing "we have 5 bangus" as a number that gets overwritten, we
store a **running list of every change**: "+42 opening stock", "-2 sold",
"-1 spoilage", and so on. The current stock is just those numbers added up.

Why this matters:

- It's like a **bank statement** for inventory. You never erase a line; if you
  make a mistake, you add a correcting line, exactly like accounting does.
- It answers the shop's actual pain point: *"why is stock at 3 when we received
  10?"* — the answer is always in the list.
- Most student projects just show a number. Ours shows the *history*. That's the
  part that makes us look different.

The word for this list is a **ledger**, and it is **append-only** — meaning you
can only add to it, never edit or delete. Those two phrases are worth memorizing.

---

## 3. Who uses it

| User | What they can do |
|---|---|
| **Customer** | Browse the catalog, filter by category, view a product's price and stock, build a shopping cart, go through checkout, track an order by its ID, and see their own past orders. |
| **Admin / staff** | Everything a customer can't: add/edit products, manage categories, adjust stock (with a reason), review orders and update their status, and see a simple dashboard. |

The only thing separating the two is a label on their account called a **role**
(either `CUSTOMER` or `ADMIN`). If a customer tries to open an admin page, they
get bounced out.

---

## 4. How the information is organized (the database, in plain words)

Everything is stored in a database. We split the information into **seven
buckets** (the technical word is "models" or "entities"). Here's each one in
everyday language:

1. **User** — a person with an account. We never store the actual password;
   we store a scrambled version of it (called a "hash") so even we can't read it.
2. **Category** — a grouping like "Fish", "Shellfish", "Crustaceans".
3. **Product** — a thing customers recognize, like "Bangus (Milkfish)". Notice a
   product has **no price and no stock** by itself — see the next bucket for why.
4. **ProductVariant** — a *specific version* of a product, like "Bangus, Whole,
   1kg" versus "Bangus, Boneless, 500g." **The price and stock live here**,
   because different cuts and sizes cost different amounts and sell separately.
5. **StockMovement** — the ledger from Section 2. One row per stock change.
6. **Order** — a customer's purchase: who bought, when, the status, and the
   total.
7. **OrderItem** — a single line inside an order ("2 × Tilapia at ₱150 each").

### How they relate

Read `1 → many` as "one of these has many of those":

- One **Category** has many **Products**.
- One **Product** has many **Variants**.
- One **User** has many **Orders**.
- One **Order** has many **OrderItems**.
- One **Variant** has many **StockMovements** and appears in many **OrderItems**.

---

## 5. Three decisions the prof will probably ask about

These come up every time. Here are the plain-language answers.

### "Why is money stored as a whole number instead of ₱299.00?"

Computers are bad at decimal math — add enough prices with decimals and totals
drift by a centavo, usually right in front of the panel. So we store money as a
**whole number of centavos**: ₱299.00 becomes `29900`. We only turn it back into
"₱299.00" when we show it on screen. No decimals stored means no rounding errors.

### "Why the stock ledger instead of just a stock number?"

A single number tells you *what* stock is, never *how it got there*. The ledger
is an audit trail. Untraceable stock is literally the client's main problem, so
solving it is the point of the project. (See Section 2.)

### "Why do you hide products instead of deleting them?"

Old orders point at the products that were bought. If we truly deleted a product,
we'd break the order history. So instead we flip a switch called `active` to
"off" — the product disappears from the store but the records stay intact. This
is called a **soft delete**.

### Bonus: "Why split Product and Variant?"

Because price and stock belong to a *specific cut and size*, not to the general
idea of "bangus." Keeping them separate avoids either forcing one price for all
sizes or copy-pasting the name across every size.

---

## 6. What we deliberately did NOT build (this is a strength, not a gap)

Having a written "out of scope" list reads as good planning, not as missing work.
Point at `docs/scope.md` if pressed. On purpose, we do **not** do:

- **Real payments.** Checkout lets the customer pick GCash or Cash on Delivery
  and shows instructions, but it captures no money. Orders simply end in a
  `PENDING` state. Handling real payment details in a school project is a
  liability we chose to avoid.
- **Real delivery tracking / couriers.** "Lalamove" in the UI is just a label,
  not a live connection. The tracker only shows our own order status.
- **Email or text notifications.** None at all.
- **Photo uploads.** Products use placeholder image links.
- **An automated test suite.** We test by clicking through it ourselves.

---

## 7. The tools we used (and why, in one line each)

You don't need to code these, just recognize the names:

- **Next.js** — the web framework that builds both the pages and the behind-the-
  scenes logic. (We're on a new version, v16.)
- **React** — the library that draws the interactive parts of the pages.
- **TypeScript** — JavaScript with safety checks that catch mistakes early.
- **Prisma** — the translator between our code and the database, so we write
  simple commands instead of raw database language.
- **PostgreSQL on Supabase** — the actual database, hosted online for free.
- **NextAuth** — handles logging in and keeping you logged in.
- **bcrypt** — scrambles passwords so they're never stored readable.
- **Tailwind CSS** — the styling system that makes it look nice.
- **Vercel** — the service that hosts our live website.

### Why two database "addresses"?

A common gotcha worth knowing: our database has **two connection links**. One
(`DATABASE_URL`) is used while the app is running and can handle lots of visitors
efficiently. The other (`DIRECT_URL`) is used only when we change the database's
structure. Using the wrong one for structure changes fails with a confusing
error — so we keep both.

---

## 8. Where everything lives (repo tour)

If someone says "show me where X is," here's the map:

| Folder / file | What's in it |
|---|---|
| `app/` | The website pages themselves. |
| `app/page.tsx` | The current prototype screen (a single big file — being broken into real pages as we wire in the database). |
| `prisma/schema.prisma` | The definition of those seven buckets. The single source of truth for the data. |
| `prisma/seed.ts` | The script that fills the database with ~50 seafood products and demo accounts. This file doubles as our **backup**. |
| `lib/prisma.ts` | The one safe way our code talks to the database. |
| `lib/products.ts` | Fetches products for the storefront and calculates stock by adding up the ledger. |
| `auth.ts` / `auth.config.ts` | The login and role-checking logic. |
| `docs/` | All the documentation, including this file. |

---

## 9. How to demo it (the 6-minute story)

The full script is in `docs/demo-runbook.md`. The short version:

1. **Open the live link** (never a laptop server). Browse the shop, filter a
   category, open a product. *"Everything here comes from a real database."*
2. **Log in as admin.** *"Access is role-based — staff only."*
3. **Create or edit a product,** then show it change on the storefront.
   *"Prices are whole-number centavos, so no rounding errors."*
4. **Adjust stock with a reason, then open the stock history.** This is the star
   moment — show the ledger. *"Every change is recorded with a reason and time;
   we correct mistakes by adding a line, never editing one."*
5. **Show the `docs/` folder** — scope, diagrams, requirements.
6. **Close:** state what's built, what's next, and what's intentionally left out.

If something breaks mid-demo, say "that's a known issue, let me show the next
part" and keep moving. Calm beats frantic clicking every time.

---

## 10. Quick glossary (memorize the bolded terms)

- **Database** — the organized store of all our information.
- **Model / entity** — one "bucket" of information (User, Product, etc.).
- **Role** — the `ADMIN` or `CUSTOMER` label that controls access.
- **Variant** — a specific size/cut of a product; where price and stock live.
- **Centavos (integer)** — how we store money to avoid rounding errors.
- **Ledger / append-only** — the stock history you add to but never edit.
- **Soft delete** — hiding a product instead of erasing it, to protect old orders.
- **Seed** — the script that loads demo data; also our backup.
- **Deploy** — publishing the site to a live public link.
- **SKU** — a unique code identifying one exact product variant.
- **CRUD** — Create, Read, Update, Delete (the basic admin actions on products).

---

*If any answer here ever disagrees with the code, the code and `prisma/schema.prisma`
win — and this file should be updated. But for explaining the project to a human,
this page is your friend.*
