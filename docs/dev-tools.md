# Developer tools (`/admin/dev`)

A developer-only section of the admin for checking the live build: is it
healthy, is it fast, is the data right, and does every UI state look right.
It is not a staff feature and adds no customer-facing capability (recorded in
`docs/scope.md` §6).

## Access

Two conditions, both required:

1. Signed in with an **ADMIN** account.
2. That account's email is listed in the **`DEV_EMAILS`** environment variable
   (comma-separated, case-insensitive).

Anyone else, including admins not on the list, gets a 404 and sees no Dev
link. With `DEV_EMAILS` empty or unset the section is off for everyone. The
check runs in `app/(admin)/admin/dev/layout.tsx` and again at the start of
every dev server action (`lib/actions/dev.ts`), because actions can be called
directly.

### Set it up

1. Create your own dev admin (recommended over the seeded `admin@hookandbox.ph`,
   whose password is printed on the login page):

   ```powershell
   $env:DEV_ADMIN_EMAIL="you@example.com"
   $env:DEV_ADMIN_PASSWORD="a passphrase of 12+ characters"
   npm run dev:admin
   ```

   This upserts one `User` with role ADMIN and a bcrypt hash. It prints only
   the email. Run it once against the shared database.
2. Allow the email:
   - Locally: add `DEV_EMAILS=you@example.com` to `.env.local`, restart `npm run dev`.
   - Live: Vercel → Project → Settings → Environment Variables → `DEV_EMAILS`,
     then **redeploy** (env changes apply to new deployments only).
3. Sign in at `/login`, then open `/admin/dev`, or click **Dev tools** in the
   sidebar footer (phone: **More**), or press `g` then `d`, or search "Dev" in
   ⌘K / Ctrl K.

## What's in it

| Page | What it does | Writes? |
|---|---|---|
| **Overview** `/admin/dev` | Runtime, commit, versions; function region vs database region with a match check; pool settings in `DATABASE_URL`; 5 × `SELECT 1` timings; row counts for all 8 models; open test orders. | No |
| **Checks and timing** `/admin/dev/checks` | The same integrity checks as `npm run check:ledger` and `check:data` (shared code in `lib/dev/checks.ts`), including SQL-vs-JavaScript stock and FIFO-age parity. **Run probes** times each data read the pages make, 3 runs each. | No |
| **Test scenarios** `/admin/dev/scenarios` | Place test orders, run a "morning rush" of simultaneous orders, clean up. | Yes (add-only) |
| **UI gallery** `/admin/dev/gallery` | Real components with fixture data in every state: product cards (in stock, low, one size out, sold out, offline), price tags, stock/age badges, every order status and tracker, buttons, chips, stamps, toasts, banners, offline panel, loading skeletons, empty basket sheet. | No |

## Test-data policy

The graders see the same Supabase database, so test traffic is controlled:

- **Add-only.** Test orders go through the real checkout code
  (`lib/orders-core.ts` `createOrderTx`). Clean-up cancels them, which writes
  compensating "back to stock" movements. Nothing is edited or deleted, so
  every test leaves a visible, explained trace in the ledger and order history.
- **One throwaway customer:** `dev-test@hookandbox.test`, name "Dev test",
  with a random password that is never stored or shown, so nobody can sign in
  as it. Delivery details are obviously fake ("Dev test street").
- **Tagged:** sale and return movements end in `· dev test`; the first
  timeline event says "Placed by dev test"; clean-up notes say "Dev test cleanup".
- **Never makes the shop look low:** orders only use items whose stock stays
  above the low-stock line (10) after the whole run.
- **Caps:** 10 orders per run, 20 in a rush (enforced on the server too).
- **Delivered test orders can't be cancelled** (same rule as staff). If you
  advance a test order to Delivered from the Orders board, it stays.
- **No reseed button.** Reseeding wipes the shared demo data and stays a
  deliberate command-line step (`npx prisma db seed`).

**Clean up before a demo:** the Overview and Scenarios pages show how many test
orders are open and how many units they hold.

### Morning rush

Sends 5–20 single-unit orders at the same moment, each in its own serializable
transaction. With **All on one item** checked, every order targets the item
with the most spare stock, and the run only starts if that item can absorb all
of them. The result reports placed / write conflicts / refused, the wall time,
and the item's stock before and after; "exactly one unit per placed order"
confirms the ledger can't be oversold. Write conflicts (`P2034`, retried once)
are the expected, safe outcome of simultaneous checkouts.

## Files

- `lib/dev/access.ts` — `DEV_EMAILS` parsing, `requireDev()`
- `lib/dev/health.ts` — environment facts, DB ping, row counts
- `lib/dev/checks.ts` — integrity checks (also used by the CLI scripts)
- `lib/dev/scenarios.ts` — test customer, safe-variant selection, open test orders
- `lib/actions/dev.ts` — probes, test orders, rush, clean-up (all `requireDev()`)
- `app/(admin)/admin/dev/**` and `components/dev/**` — the pages
- `scripts/create-dev-admin.ts` — `npm run dev:admin`

## Notes

- Dev pages carry `robots: noindex`. A non-developer's 404 is rendered after
  the admin shell starts streaming, so the HTTP status can be 200 while the
  page shows Not Found; no dev data is ever sent.
- Probes run on the server you're viewing; locally they measure your machine
  and its distance to Singapore. Use the deployed site for real numbers and
  record them in `docs/performance.md`.
