# UI Overhaul Plan — "Palengke Price Board"

**Status:** Draft for approval · 2026-10-10
**Covers:** storefront `(shop)` and admin `(admin)`, end to end.
**Product context:** [`PRODUCT.md`](../PRODUCT.md). **Direction contract:** `.impeccable/surfaces/app-shop-page-tsx.md`.

---

## 1. Decisions already made

| Topic | Decision |
|---|---|
| Visual world | **Palengke Price Board**: the site is the stall's price board, with hand-lettered cardboard price cards stuck in crushed ice. |
| Storefront loudness | Full palengke: tilted price cards, sign-painter headlines, a tarp price crawl, stamps, ice texture. |
| Admin register | Same materials, kept quiet: ice-white and ink, cardboard tags as status chips, stamps only to confirm an action. |
| Voice | English copy, with Filipino only for species and dish names. |
| Admin device | Desktop power layout **and** a thumb-friendly phone mode. |
| Admin features | Every frozen-scope feature made real, plus speed UX, Morning count, Walk-in sale, Today's prices board, and an order status timeline. |
| Build depth | Real App Router routes wired to Prisma/Supabase; the prototype view switcher is removed. |
| Imagery | Real free-license photos (Unsplash/Pexels), each with its credit recorded. |
| Motion | Add the `motion` library (springs, enter/exit, shared-layout animations). |

**Palette:** batya blue `#1E5EFF` · tarp yellow `#FFD23F` · marker red `#D7263D` · cardboard `#D9B98A` · ice `#EAF6FB` · ink `#111111`. Each category also gets one hue of its own, used on every surface.

**Type:** a chunky sign-painter display face, marker-lettered price numerals, and Geist for UI text. The final faces are picked from rendered trials during Phase 0.

---

## 2. What's wrong today (audit summary)

- **Storefront:** no product photos (`public/products/` is empty), identical cards, almost no motion (the basket "wiggle" class doesn't exist), and no product detail page, variant picker, customer login, or order history, all of which are in scope. The checkout doesn't save anything, and the order ID is always `#HB-005`.
- **Admin:** stock edits **overwrite the count with no reason**, which breaks the ledger rule. The ledger adds different SKUs into one running balance. The Confirm, Book, Delivered, and Save buttons do nothing. Dashboard numbers are hardcoded. Login is a client-side `admin/admin123` check. Product edit/archive, categories, per-variant history, and role-gating are all missing.
- **Structure:** one 2,634-line `"use client"` file with no URLs per screen.

---

## 3. Schema changes (needs migration + `docs/data-model.md` + ERD)

| Change | Why |
|---|---|
| `Product.imageUrl String?` | Static photo path per product (no upload). |
| `Order.code String @unique` (e.g. `HB-0005`) | Readable ID for tracking and receipts. |
| `Order.paymentMethod` enum `GCASH \| COD` | Scope says checkout records a method; there's no column for it today. |
| `Order.deliveryName / deliveryPhone / deliveryAddress / deliveryBarangay / deliverySlot` | Checkout collects these; there's nowhere to store them today. |
| `model OrderStatusEvent { orderId, fromStatus, toStatus, actorId, note, createdAt }` | Append-only order timeline (who and when). |
| `StockMovement.actorId String?` | The ledger shows who made each change. Still append-only. |
| `ProductVariant.priceUpdatedAt DateTime?` | Drives the "price changed today" flash on the storefront crawl. |

Each of these needs a new `footguns` rule: `OrderStatusEvent` is never updated or deleted, same as `StockMovement`.

---

## 4. Route map

```
app/
  (shop)/
    layout.tsx            tarp crawl + header (logo, search, basket)
    page.tsx              today's catch: hero board, category hues, dish filters
    c/[slug]/page.tsx     category (URL reflects the filter)
    p/[id]/page.tsx       product detail: variants, scale-needle picker
    checkout/page.tsx     review → delivery → payment → receipt
    track/page.tsx        track by order code
    account/orders/       my orders
    login/ register/      customer auth
    about/ contact/
  (admin)/admin/
    layout.tsx            left rail (desktop) / bottom tabs (phone), ⌘K, shortcuts
    page.tsx              "Today" inbox + KPIs + hand-built charts
    orders/ [code]/       tabs by status, drawer with timeline
    products/ [id]/ new/  table + side-drawer editor
    categories/
    stock/                adjust sheet, walk-in sale, morning count
    prices/               today's prices board
    ledger/               per-variant ledger
proxy.ts                  rejects non-ADMIN from /admin (Next 16 proxy; replaces middleware)
lib/actions/*.ts          server actions: orders, stock, products, prices
components/ui/*           shared primitives (below)
```

---

## 5. Shared primitives (`components/ui/`)

`PriceCard` (tilted cardboard tag) · `Stamp` (ink thump) · `Odometer` (rolling digits) · `Batya` (basket target + jiggle) · `TarpCrawl` · `Button` (pressed state, spring) · `Tag` (cardboard chip with category hue) · `Sheet` / `Drawer` · `Toast` with **Undo** · `CommandPalette` (⌘K) · `Kbd` + shortcut sheet (`?`) · `Stepper` (big +/−) · `ScaleNeedle` · `EmptyState` (lettered card).

All motion goes through one `motion` preset file (spring tokens, durations), and every component has a reduced-motion path.

---

## 6. Storefront plan

**Signature interactions**
1. **Basket toss:** "Add" lifts the product photo and arcs it on a spring into the batya; the basket jiggles and its count rolls.
2. **Price cards:** each card sits at a slight, fixed tilt (seeded per product) and straightens on hover or focus.
3. **Variant picker:** 500g / 1kg / Whole swings a hanging-scale needle; the price rolls.
4. **Sold out:** a marker stroke draws across the card, stamped "SOLD OUT".
5. **Free-delivery basin:** ice fills toward ₱500, then a "FREE DELIVERY!" stamp lands.
6. **Receipt:** placing an order prints a paper receipt with the marker-lettered code, stamped "THANK YOU!".
7. **Tarp crawl:** today's real prices scroll; prices changed today flash.
8. **Shared-layout morph:** a price card grows into the product detail page.
9. **Tracker:** a stall → cooler → rider → door strip; each stage stamps in.

**Flows to make real:** catalog from the DB, category in the URL, name search, product detail with variants and live stock, a basket persisted in localStorage, login-gated checkout that writes `Order` + `OrderItem` + negative `StockMovement`s in one transaction (rejecting oversell), track by code, my orders, register/login.

---

## 7. Admin plan

**Shell:** left rail with counts (desktop), bottom tab bar (phone), ⌘K palette (jump to products, orders, actions such as "adjust stock bangus"), letter shortcuts with a `?` sheet, and an undo toast after every change. Changes show instantly and reconcile with server actions in the background.

**Screens**
- **Today (dashboard):** an attention inbox with orders to confirm, low and out-of-stock items, and the To Sale (7+ days, FIFO) queue, each with an inline action. KPI tiles are computed from real data (today's orders, revenue, pending, alerts). Hand-built charts: 7-day sales bars and top sellers.
- **Orders:** status tabs with counts, multi-select with bulk "Confirm", an order drawer (items, delivery, payment, timeline), and a one-key **advance** (PENDING → CONFIRMED → READY → COMPLETED). Cancel asks for a reason and writes compensating stock movements.
- **Products:** table with search, category, and status filters; expandable variant rows; inline price edit with keyboard navigation; a create/edit side drawer with a **live storefront price-card preview**; archive with undo (soft delete).
- **Categories:** create and rename inline; the hue preview is derived from the slug.
- **Stock:**
  - *Adjust sheet:* variant picker, big +/− stepper, reason chips (Restock, Spoilage, Miscount, Return) plus a note, and a "120 → 115" preview. Saving stamps a ledger row.
  - *Walk-in sale:* a phone-first one-tap flow (variant + quantity) that writes a "Walk-in sale" movement.
  - *Morning count:* step through each variant, type the physical count, and the difference is written as "Morning count" movements. Zero-difference rows write nothing.
- **Today's prices:** a spreadsheet-like sheet where you Tab through prices, save all at once, and changes flag `priceUpdatedAt`.
- **Ledger:** per-variant running balance (fixes the mixed-SKU total). Selecting a variant lifts its rows and dims the rest. Filters by reason and date. A **"Counter this entry"** button pre-fills a compensating movement. New rows stamp in. There is no edit or delete anywhere.

---

## 8. Phases

| Phase | Output |
|---|---|
| 0 · Foundations | Tokens in `globals.css`, fonts, `motion` installed, `components/ui` primitives, photos + `docs/design/photo-credits.md` |
| 1 · Data | Schema migration, seed update (codes, image URLs, events), `lib/actions`, `proxy.ts` role gate, NextAuth login |
| 2 · Storefront | Routes in §4, signature interactions in §6 |
| 3 · Admin | Shell + screens in §7 |
| 4 · Cleanup | Delete `StoreApp.tsx` and `prototype_src/` usage, remove the view switcher |
| 5 · Finish | Desktop + mobile review, finish review, `DESIGN.md` rewritten from the built world, docs updated |

Every phase ends with entries in `docs/changelog.md` and updates to the affected topic docs (`data-model.md` + ERD, `scope.md` change log, `project-overview.md`, `deployment.md` if env changes). `npm run verify` runs once at the end of each phase.

---

## 9. Open items

- Final display and marker faces, picked from rendered trials in Phase 0.
- Checkout requires login (`Order.customerId` is required). The flow lets a guest register inline at the delivery step.
- `docs/scope.md`: no feature leaves scope, but the change log should record the new schema fields and the four admin flows as in-scope implementations.
