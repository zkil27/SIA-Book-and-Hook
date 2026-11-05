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
- **Prisma `relationJoins` preview** and a `LazyMotion` refactor: small gains
  for preview-feature or many-file risk.

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
