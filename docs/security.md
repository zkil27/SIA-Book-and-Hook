# Security notes

Written for the team and the panel. All data in this project is fictional, but
the app is built as if it weren't. If this file and the code disagree, the code
wins: fix this file.

## Order tracking by code (fixed 2026-11-08)

**The finding.** Order codes are sequential (`HB-0001`, `HB-0002`…). Until
2026-11-08, `/track?code=…` and `/receipt/[code]` showed any order to anyone
who typed its code. Name, phone and address were already hidden, and cancelling
already required the signed-in owner (fixed 2026-11-05), but anyone could step
through every number and read each order's items, totals, payment method,
delivery slot and the customer's own cancellation notes. They could also count
the store's orders. This is an insecure direct object reference (IDOR), the
same class of bug as CVE-2025-65647, where sequential order IDs let attackers
harvest orders in bulk.

It mattered more once delivery moved onto the store's own truck: orders gained
a handoff PIN and a stop position, and those must never be one guess away.

**The fix.** `lookupOrder()` in `lib/orders.ts`, with the rules in
`lib/track-access.ts`. An order opens only for:

1. the signed-in customer who placed it;
2. staff (admin, packer, driver);
3. anyone holding its **tracking link** (`?t=…`): an HMAC-SHA256 of the order
   number under `AUTH_SECRET`, cut to 22 characters. The `/track` form hands
   out the link after the visitor enters the code **and the last 4 digits of
   the delivery phone** (`verifyTrack` in `lib/actions/track.ts`).

A missing order, a wrong code and wrong digits all get the same answer, so the
form doesn't reveal which order numbers exist. Comparisons use
`timingSafeEqual`.

**The handoff PIN** goes only to the order's own signed-in customer, on `/track`
and `/account`, while the order is packed or on the truck. It is never on the
receipt (receipts get printed), never on a tracking-link view, never on any
admin or staff screen. Staff reads in `lib/trips-data.ts` only expose whether a
PIN exists and whether it's locked.

**Driver data.** A driver sees customer names, phones and addresses only for
stops on their own trip (`/staff/trip/[id]` redirects anyone else). The
loading screen shows first names and barangays only.

## Residual risk

- **No rate limit on the 4 digits.** Serverless functions keep no shared
  memory, so there is nowhere to count guesses without adding a store (e.g.
  Upstash). One order can be opened in at most 10,000 guesses. That turns a free
  sweep of every order into a slow, per-order attack, and the data behind it
  has no name, phone or address. A real limiter stays out of scope.
- **PIN guessing by a driver.** A driver could try PINs on their own stops.
  Each wrong PIN is counted and the PIN locks after 5 tries
  (`PIN_MAX_TRIES`). From then on, only a logged reason plus the receiver's
  name can finish the stop, and the admin inbox flags every no-PIN delivery.
- **Tracking links don't expire.** They are tied to `AUTH_SECRET`; rotating the
  secret invalidates every link.

## Dev account switcher (2026-11-07)

`lib/actions/dev-switch.ts` lets a developer sign in as any account without
its password, to test each role. It is gated three times, all failing closed:

1. The action reads the session's own user, or the developer it records as
   `devOrigin`, **from the database** and requires role ADMIN and an email
   on `DEV_EMAILS`. Unset `DEV_EMAILS` = nobody.
2. It then mints a ticket (`lib/dev/switch-token.ts`): `{target, origin,
   exp}` signed with HMAC-SHA256 over `AUTH_SECRET`, valid 60 seconds.
3. Only the `dev-switch` Credentials provider in `auth.ts` accepts the
   ticket, and it re-checks the origin (ADMIN + allowlist) before returning
   the target user.

The JWT carries `devOrigin` so the pill can offer "Back to me"; any normal
sign-in clears it. Residual risk: anyone holding an allowlisted developer
account can act as any user, including seeing a customer's handoff PIN on
their account page. Keep `DEV_EMAILS` to the team's own accounts and leave
it unset when not needed.

## Role gate

`lib/roles.ts` holds one table of which role may open `/admin`, `/staff/pack`,
`/staff/load` and `/staff/trip`. The proxy (`proxy.ts` → `auth.config.ts`)
turns the wrong role away before a page renders. Every layout, page and server
action then checks again with `requireRole()` / `requireAdmin()`
(`lib/session.ts`), so a direct server-action call can't skip the proxy.
