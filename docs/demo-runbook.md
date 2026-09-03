# Demo Runbook

Rehearse this end to end on **September 4**. Not a mental walkthrough — actually
click every step, from the live URL, on the machine you'll present from.

---

## The rule

**Demo from the live URL. Never from localhost.** A cold `npm run dev` in front
of a panel is how a working project looks broken. If the deployment is down, you
have a bigger problem than the demo, and you want to discover that on the 4th.

## Before the demo

- [ ] Live URL loads, product list renders seeded data
- [ ] Admin credentials tested by logging in and out **today**, not last week
- [ ] Supabase project status is **Active**, not paused
- [ ] Browser tabs pre-opened: storefront, admin login, GitHub repo, docs folder
- [ ] Logged out of any admin session, so the login step is real
- [ ] Notifications and messages silenced
- [ ] Credentials written on paper — do not rely on autofill or memory
- [ ] Phone hotspot ready in case venue wifi fails
- [ ] A screen-recording of the full flow saved locally, as a last-resort fallback

## The script — about 6 minutes

**1. Storefront (60s)**
Open the live URL. Browse the catalog. Filter by category. Open a product detail
page showing variants and stock.
> "This is deployed and running against a real Postgres database — everything on
> screen is coming from the database, not mock data."

**2. Admin login (30s)**
Log in with the admin account. Land on the admin dashboard.
> "Access is role-based — accounts carry an ADMIN or CUSTOMER role, checked in
> middleware and again on every action that changes data."

**3. Product CRUD (90s)**
Create a product. Give it a real name — not "test test". Save it. Open the
storefront in the other tab and show it appearing.
Then edit an existing product's price and show the change reflected.
> "Prices are stored as integers in centavos, so there's no floating-point
> rounding error in any total."

**4. Stock adjustment and history (90s)** — *the important one*
Adjust stock on a variant with a reason. Then open the stock history screen and
show the movement you just made sitting on top of the seeded history.
> "Stock changes are recorded in an append-only ledger rather than just
> overwriting a number. Every change has a reason and a timestamp, so a
> discrepancy can always be traced. Corrections are written as compensating
> entries — nothing in the ledger is ever edited."

This is the moment that separates the project from a typical class demo. Don't
rush it.

**5. Documentation (60s)**
Show `docs/` in the repo: scope with its out-of-scope section, the ERD, the SRS
draft.
> "The ERD is generated from the Prisma schema, so it can't drift out of sync
> with the actual database."

**6. Close (30s)**
State plainly what's built, what's next, and what's deliberately excluded.
Pointing at a written out-of-scope section reads as planning, not as a gap.

---

## Likely questions

**"Why no checkout / payment?"**
Deliberately out of scope — point to `docs/scope.md`. Handling real payment
credentials in a class project is a liability, and the graded work is in the
catalog, stock, and admin systems.

**"Why store money as integers?"**
Floating-point can't represent most decimal fractions exactly, so sums of prices
drift. Integers in centavos make arithmetic exact.

**"Why a stock ledger?"**
A single stock number says what stock is, never how it got there. The ledger is
an audit trail, and untraceable stock discrepancies are the client's actual
problem.

**"Is this really deployed?"**
Yes — show the URL bar, or open it on a phone.

**"What if the database goes down?"**
Managed Postgres on Supabase. The demo data is reproducible from a committed
seed script.

**"What did each member do?"**
Have this answer ready before the room asks. Git history backs it up.

---

## If something breaks mid-demo

Say what you're doing and keep moving. "That's a known issue, let me show you the
next part" costs nothing. Silent frantic clicking costs a lot. Move to the next
section and come back only if there's time.

If the whole site is down: open the screen recording, say the deployment is being
investigated, and walk through the recording. Never try a live `npm run dev`
recovery in front of a panel.
