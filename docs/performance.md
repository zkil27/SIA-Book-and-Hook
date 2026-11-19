# Performance

Why the admin (and parts of the storefront) were slow, what changed on
2026-11-05, how to measure, and what was deliberately not done.

## How to measure

- **On the deployed site:** sign in as a developer, open `/admin/dev/checks`
  and press **Run probes**. Each read the pages make runs three times on the
  server; the table shows each run and the median (over 300 ms is flagged).
  `/admin/dev` shows the database round trip (`SELECT 1` × 5) and whether the
  function region matches the database region.
- **Locally:** set `PRISMA_LOG=query` in `.env.local` and restart `npm run dev`
  to print every SQL statement. Local timings include the trip from your
  machine to Singapore, so use them to count statements, not to judge speed.

Record numbers in the table at the bottom after each deploy that touches
data access.

## What was slow (found 2026-11-05)

| # | Cause | Where | Effect |
|---|---|---|---|
| 1 | Every admin page loaded **every StockMovement row** and summed them (plus a FIFO sort per variant) in JavaScript. | `lib/admin-data.ts` `loadInventory`, called from the admin layout | Cost grew with the ledger forever; ran on every admin request. |
| 2 | The admin layout waited for counts + the full inventory + 60 orders before showing anything. | `app/(admin)/admin/layout.tsx` | Nothing appeared until all of it finished; the data only fed badges and the ⌘K palette. |
| 3 | No `loading.tsx` anywhere. | `app/` | No streaming; Next 16 doesn't prefetch dynamic routes without a loading boundary, so every click waited for a full server render. |
| 4 | Every write called `revalidatePath("/", "layout")`. | `lib/actions/util.ts` (15 call sites) | Each save re-rendered the whole tree and re-ran #1. |
| 5 | The ledger page read the full ledger twice; the 1/7/30-day filter ran in JavaScript after loading all history. | `loadLedger`, ledger page | Slowest admin page. |
| 6 | Orders page ran its queries one after another, then fetched 200 orders again to find one `?open=` code. | `app/(admin)/admin/orders/page.tsx` | Extra sequential round trips. |
| 7 | Dashboard totals and top sellers were computed in JavaScript from full order rows. | `getDashboard` | Over-fetching; "Waiting to confirm" was capped at 8. |
| 8 | No indexes on foreign keys or filtered columns. | `prisma/schema.prisma` | Sequential scans that grow with data. |
| 9 | No `vercel.json`: functions ran in Vercel's default region (Washington, D.C.) while Supabase is in Singapore. | deployment | Every query crossed the Pacific (~200 ms each), several per page in sequence. |
| 10 | Storefront layout awaited the full catalog + `auth()` on every page; the stock sum scanned the whole ledger; `/p/[id]` loaded the whole catalog. | `app/(shop)/layout.tsx`, `lib/catalog.ts` | Every shop page waited on the database before sending any HTML. |
| 11 | All images were full-size JPGs (76–604 KB) via `<img>`; `/login` downloaded a 604 KB photo on phones where it's hidden. | storefront + admin | Several MB on the home page. |
| 12 | Any basket change re-rendered all ~30 product cards. | `components/shop/basket.tsx` | Janky taps on phones. |

## What changed

1. **Stock math in SQL** (`lib/stock-sql.ts`): `SUM` per variant via `groupBy`,
   and the FIFO "oldest stock still on hand" via a window query. No ledger rows
   are loaded. Stock is still never stored; the ledger stays the only record.
   `lib/ledger.ts` remains the reference, and `npm run check:ledger` (and the
   dev Checks page) compare the two for every variant.
2. **Admin streams:** the layout awaits only the session (a JWT decode, no
   database). Badge counts and the palette arrive as a promise read with
   `use()`; pages get `loading.tsx` skeletons and an `error.tsx` boundary
   (database-offline message with Try again).
3. **Targeted invalidation:** `invalidate("admin" | "orders" | "shop")`
   replaces `refreshAll()`. Duplicate `router.refresh()` calls were removed.
   `getUser()` is deduplicated per request with React `cache()`.
4. **Ledger in SQL:** running balance via `SUM() OVER (PARTITION BY variant …)`
   over full history, period/variant filter after it, newest 300 rows.
5. **Orders / dashboard / product editor:** parallel queries, single-order
   lookup for `?open=`, `aggregate` for today's totals, SQL top sellers, real
   pending count, single-product query for the editor.
6. **Indexes** (migration `20261105000000_add_query_indexes`).
7. **Region:** `vercel.json` pins functions to `sin1` (Singapore), next to the
   database. `connect_timeout=5&pool_timeout=10` on `DATABASE_URL` makes a
   paused database fail fast so the offline fallback shows quickly.
8. **Storefront streams:** the layout awaits nothing; the price crawl, signed-in
   header and offline banner stream in behind Suspense. `loading.tsx` added.
   The stock sum only covers sellable variants; `/p/[id]` reads one product.
   `/account` no longer loads order timelines it never shows.
9. **Images:** `next/image` everywhere with per-placement `sizes` (AVIF/WebP at
   the displayed width; lazy below the fold). Two fonts no longer preload.
10. **Basket:** an external store (`useSyncExternalStore`); cards subscribe to
    their own variant's quantity only.

## Deliberately not done

- **Cache Components / `"use cache"` for the catalog.** Planned, then dropped
  after reading the Next 16.3 docs (`use-cache.md`, "Runtime caching
  considerations"): with the default in-memory handler on serverless hosts
  like Vercel, cache entries typically don't persist across requests. The
  benefit would come only from prerendered static shells, which would need the
  database at build time, could bake the offline fallback into a shell, and
  would change how every route renders (Activity-preserved state, Suspense
  rules) right before a graded deploy. `"use cache: remote"` fixes persistence
  but adds platform cost. With functions next to the database, a catalog read
  is two small queries, so the trade isn't worth it now. Revisit if probes
  show the catalog read is still the bottleneck.
- **A stored stock column.** Faster reads, but every write path would have to
  keep it in sync and it could drift from the ledger. SQL aggregation is fast
  at this data size.
- ~~**Prisma `relationJoins` preview**~~: adopted in speed pass 2 (below),
  once the staff and trip reads made nested includes the biggest cost.
- A `LazyMotion` refactor: a small bundle gain for many-file risk.

## Speed pass 2 (2026-11-07)

Still slow locally and deployed after the trips/staff work landed. The auth
path was clean (the proxy only matches `/admin` and `/staff`; the JWT
callbacks make no database calls). What cost time:

| # | Cause | Where | Fix |
|---|---|---|---|
| 1 | Prisma 5 ran **one query per relation level, in sequence**: an Orders tab ≈ 9 queries, a trip ≈ 8, an order lookup ≈ 7. | `orderInclude`, `tripInclude`, `packSelect`, `findRow` | `relationJoins` preview + `relationLoadStrategy: "join"` on every hot nested read: one statement each. |
| 2 | Staff screens **rendered twice per action**: the action's revalidation plus a client `router.refresh()` (and a 1.1 s wait on the driver screen). | `LoadList`, `PickList`, `TripRun` | Refresh only on errors. |
| 3 | Every packer/driver action **re-rendered the admin layout** (`invalidate("admin")`). | `lib/actions/trips.ts` | Staff actions refresh `staff` + `orders`; only dispatch actions touch `admin`. |
| 4 | **Row-by-row writes inside serializable transactions**: start trip 2N+5 round trips, draft/renumber N, bulk confirm 2N, prices N, product save N. | trips, admin-orders, admin-catalog actions | `UPDATE … FROM unnest(…)`, `updateMany` + `createMany`, `UPDATE … RETURNING`. Single-order advance and `setLoaded` use a guarded `updateMany` (no read, no serializable). |
| 5 | The **Orders list loaded every order's whole timeline, phone and address**, and opening an order re-rendered the page on the server (≈ 19–28 queries). | `listOrders`, `OrdersBoard` | Slim list select; the drawer opens instantly from list data, the URL updates with `history.replaceState`, and phone/address/timeline load via `orderDetail`. |
| 6 | Orders board **re-rendered every row on hover and keystroke**; 200 rows with `layout` animation. | `OrdersBoard` | Memoised rows, CSS hover, `useDeferredValue` search, one keydown subscription (`useEffectEvent`), no row layout animation. |
| 7 | **Place order** waited for `/checkout` to re-render, and the checkout page read the whole catalog just for an "offline" flag. | `invalidate("shop")`, checkout page | Don't revalidate `/checkout`; derive offline from the page's own reads. |
| 8 | Sequential or unbounded staff reads. | `dispatchBoard`, `tripsToLoad`, `openTripsFor`, pack page | groupBy into the `Promise.all`, date bounds + `take`, a count/light list instead of 200 full orders. |
| 9 | Ledger running balance windowed over the **whole** table even for "Today"; FIFO age sorted sold-out variants too. | `loadLedger`, `oldestInflowByVariant` | Balance = current stock − later movements, over the period only; FIFO only for variants in stock. |
| 10 | Badge counts were 3 queries; the dashboard bucketed a week of orders in JS. | `countsWith`, `getDashboard` | One SQL statement; `GROUP BY` day in SQL. |
| 11 | Revisiting a tab always refetched (`staleTimes.dynamic` 0). | `next.config.ts` | `experimental.staleTimes.dynamic = 30`; writes still clear it. |
| 12 | Stock sums read every ledger row from the table. | schema | Covering index `StockMovement(variantId, quantity)`, plus `Order(createdAt)`, `OrderStatusEvent(toStatus, createdAt)` (migration `20261109000000_perf_indexes`). |

**Expected statement counts** (from the code, not yet measured; fill in with
`PRISMA_LOG=query`): Orders tab switch ≈ 10 → 2; opening an order ≈ 19 → 1
(a server action, no page render); ticking a bag ≈ 5 + 2 renders × 8 → 1 + 1
render × 1; starting a 10-stop trip ≈ 25 → 6; bulk-confirming 10 orders ≈ 22
→ 3.

**Deploy:** `npx prisma migrate deploy`, then `connection_limit=3` on
Vercel's `DATABASE_URL` (`docs/deployment.md`).

**Local `npm run dev` will always feel slower:** each query crosses from
your machine to Singapore (≈ 40–60 ms), and each route compiles on first
visit. Judge speed on the deployed site or with `npm run build; npm run start`.

**Still not done (follow-ups):** client-side filtering on the storefront home
(each filter chip is a server round trip), server-rendered product cards,
a `LazyMotion` bundle trim, `prefetch={false}` on the price crawl's links,
and a cross-request catalog cache.

## Measurements

Fill from the dev Checks page (deployed site, medians in ms).

| Read | Before (iad1, JS stock math) | After (sin1, SQL stock math) |
|---|---|---|
| Database round trip | | |
| Admin inventory | | |
| Admin badge counts | | |
| Today dashboard | | |
| Orders board | | |
| Stock ledger, 30 days | | |
| Storefront catalog | | |
| Track an order | | |

The "before" column can only be measured on a deploy of the previous commit;
if that isn't practical, record the first post-change run and compare future
runs against it.
