# Change Log

Every change an AI agent makes to this repository is recorded here, per the
"MANDATORY: document every change" rule in `AGENTS.md`. Newest entries on top.

Each entry follows: **Date — summary**, then What / Why / Impact.

---

## 2026-10-01 — Add project DESIGN.md adapted with signature blue palette

**What:** Added `DESIGN.md` in the project root defining the Aura Intelligent Hub design system specification.
- Configured tokens for colors, typography (Geist + System Font), layout (flex, full bleed, 4px base rhythm), elevation/depth (glass, hairline border shell), shapes (2px/4px/6px tight radius), components (primary/link buttons, card surfaces), motion rules, and WebGL atmospheric background.
- Adapted the primary and accent colors from the template's `#10B981` to Hook & Box's signature brand blue / teal (`#34A6BD`), along with brand supporting tokens (`#58C6DB` cyan, `#1C6E80` deep teal, and `#103A45` ink).

**Why:** User requested to add the Aura design system specification as the project's design system while preserving Hook & Box's signature blue brand color.

**Impact:** `impeccable context` and other AI design tools now resolve `DESIGN.md` as the normative design authority for styling and UI generation.

## 2026-10-01 — Install Impeccable design skills and toolsets across AI agents

**What:** Installed `impeccable` design skill suite across project agent environments (`.agents`, `.claude`, `.cursor`, `.github`, `.kiro`) using `npx impeccable install --project -y`.
- Added skill definitions (`SKILL.md`), design command playbooks and references (`reference/`), scripts and CLI binaries (`scripts/bin/windows-x64/impeccable.exe`) to `.agents/skills/impeccable/`, `.claude/skills/impeccable/`, `.cursor/skills/impeccable/`, `.github/skills/impeccable/`, and `.kiro/skills/impeccable/`.
- Configured agent hooks and definitions in `.claude/settings.local.json`, `.cursor/hooks.json`, `.github/hooks/impeccable.json`, `.codex/hooks.json`, and agent profiles in `.claude/agents/`, `.cursor/agents/`, and `.github/agents/`.
- Updated `README.md` to document the new `impeccable` design skill alongside `frontend-design` and `hookandbox-stack`.

**Why:** User requested to install `impeccable` to equip AI coding agents with a structured UI/UX design workflow, anti-pattern detection, design audit, and styling polish tools.

**Impact:** AI assistants (Antigravity, Claude Code, Cursor, Copilot, Kiro) now have access to `/impeccable` commands (`init`, `critique`, `audit`, `polish`, `bolder`, `quieter`, `typeset`, etc.) and anti-pattern detectors for frontend refinement. No changes to database schema or application runtime logic.

## 2026-09-26 — Storefront resilience: catalog fallback for paused/offline database

**What:** Added graceful error fallback handling to `lib/products.ts` and created `lib/fallback-catalog.ts`.
- `getStorefrontProducts()` and `getStorefrontCategories()` now catch database
  connection and initialization errors (such as `PrismaClientInitializationError`
  when Supabase pauses or cannot be reached) and return seeded catalog products
  and categories rather than letting unhandled rejections crash the Server Component.
- Created `lib/fallback-catalog.ts` containing static fallback catalog data derived
  from the canonical seed catalog (`prisma/seed.ts`), preserving all product names,
  categories, variants, prices, and stock indicators.
- Updated `docs/deployment.md` with instructions on Supabase unpausing and offline
  resilience.

**Why:** The dev server at `localhost:3000` crashed with `PrismaClientInitializationError: Can't reach database server at 'aws-0-ap-southeast-1.pooler.supabase.com:6543'`
because the Supabase free-tier project (`gzbxzmexgdsvrvrrtmdr`) was automatically paused
after inactivity, causing pooler queries to fail (`tenant/user ... not found`).

**Impact:** The app immediately loads cleanly on `localhost:3000` even when the
database is temporarily paused or offline. When Supabase is unpaused/active, it
seamlessly queries the live database and ledger.

## 2026-09-05 — Checkout layout: 70/30 split, natural height (reference for site-wide rule)

**What:** Reworked the checkout layout in `app/StoreApp.tsx` (`PaymentView`) to
fix the persistent "empty" feeling on short carts.
- Adopted a **70/30 layout proportion**: main column `md:basis-[70%]`, price
  sidebar `md:basis-[30%]` (was `flex-1` + fixed `md:w-72`); container widened
  `max-w-4xl`→`max-w-5xl` so the split fills more of the viewport width.
- **Reverted the full-height stretch + vertical centering** tried in the
  previous iteration. Forcing the content to fill the viewport and then centering
  it only relocated the empty space and left the decorative wave floating in a
  void. The checkout now sits at its natural content height, top-aligned under
  the step bar like a normal form page (Stripe/Shopify-style); the area below is
  plain page background, which reads as expected for a short form rather than a
  stretched-empty container.
- Kept the reassurance strip and the decorative wave (now at `max-w-5xl`).

**Why:** User reported it still felt empty, then that centering "changed
nothing". Root cause: a one-line order cannot fill a full-viewport page, so
alignment tricks don't help — the fix is to stop stretching to full height.

**Impact:** Cosmetic/layout only; no scope, dependency, or asset change. Mobile
still stacks single-column. This is the agreed **70/30 reference**; rollout to
the other two-column screens (Shop rail, Admin) is pending user review.

## 2026-09-05 — Fill checkout dead space across all four steps (presentation-only)

**What:** In `app/StoreApp.tsx` (`PaymentView`), addressed the large empty band
below the cards on the short checkout steps (Order Review, Confirmation). No new
features, dependencies, or image assets.
- Rebalanced the checkout wrapper: `max-w-3xl`→`max-w-4xl`, added `items-start`
  and `min-h-[calc(100vh-8.5rem)]` so short steps no longer sit top-heavy over a
  blank band; widened the price sidebar `md:w-64`→`md:w-72` for proportion.
  Mobile stacking is unchanged.
- Added a restrained, reusable `CheckoutNotes` block (hairline top border, one
  muted icon + short label + one honest line per item, 3-up) built only from the
  existing `Ic*` icon set and brand tokens. Wired it below the active step card
  on all four steps via a `STEP_NOTES` map with step-appropriate copy.
- Added an understated `aria-hidden` SVG wave band (`--teal`/`--cyan`) at the
  bottom of the checkout container as a finishing touch.

**Why:** The Order Review step showed a large blank area under the summary card
(user report). Filled it intentionally rather than with generic filler.

**Impact:** Cosmetic/layout only. Copy is honest to frozen scope — no real
payment settlement (orders stay `PENDING`), Lalamove is a UI label, no real
SMS/email is claimed. No schema, dependency, or asset changes; no new routes.

## 2026-09-05 — Fix CssSyntaxError from `*/` inside a globals.css comment

**What:** In `app/globals.css`, the token-block comment contained the literal
`--coral*/--shadow-coral`. The `*/` prematurely closed the CSS comment, so
PostCSS parsed the trailing text as CSS and threw
`CssSyntaxError: Unknown word are`. Reworded the comment(s) to spell the token
names out with no `*/` sequence.

**Why:** Dev server / build failed to compile `globals.css` after the palette
reskin below.

**Impact:** Comment-only fix; no token values changed. `globals.css` parses
again.

## 2026-09-05 — Re-skin palette to match the Hook & Box logo (teal / cyan / mint)

**What:** Palette-only reskin so the UI resembles the logo. No layout, rounding,
spacing, or shadow-structure changes.
- `app/globals.css` `:root`: re-pointed the color tokens to a logo-matched
  scale — `--teal #34A6BD`, `--teal-deep #1C6E80`, new `--cyan #58C6DB`,
  `--aqua #B7ECEB` (logo mint fill), `--ink #103A45`, and cooler mint-tinted
  canvas (`--paper #EAF6F6`, `--paper-2 #D8EEEE`, `--card #F8FDFD`). Retired
  coral as a co-brand hue: added `--accent #FF7A4D` / `--accent-ink #C7431F`
  (single warm complementary pop) and `--shadow-accent`. Kept
  `--coral`/`--coral-ink`/`--shadow-coral` as **legacy aliases → `--accent*`**
  so existing CTA/alert call sites keep working.
- `app/StoreApp.tsx` (targeted edits only, no rewrite): split coral's old triple
  role. Brand "Box" text → `--cyan`; the "Shop" nav underline and top-selling
  data-viz bar → `--teal`; the Revenue dashboard card off the accent onto
  teal/cyan. Moved every money/price value (product cards, cart line + totals,
  admin order/inventory totals, checkout line/total/COD/confirmation, order
  tracking) off `--coral-ink` onto neutral deep-teal mono `--ink`. The warm
  accent now appears **only** on the primary CTA (filled `Btn`, cart button),
  the active admin tab, and true alerts (out-of-stock dot/count/status, login
  error, destructive Remove/Clear, required-field asterisk). Updated the
  design-system legend comments in both files.

**Why:** User asked to restyle the UI so the color palette resembles the logo
(saturated teal/cyan field, light mint fill). Chosen approach (confirmed with
user): palette-only; retire coral as the hero but keep one complementary warm
accent so CTAs/alerts still pop; apply across all rendered surfaces.

**Impact:** Purely visual. Token names changed — prefer `--accent`/`--accent-ink`/
`--shadow-accent` and `--cyan` going forward; `--coral*`/`--shadow-coral` remain
as aliases for the CTA/alert call sites still using them (retire later if those
sites are renamed). Semantic rule for future work: **brand = teal/cyan/mint,
money = deep-teal mono `--ink`, accent = CTA + alerts only.** Verified once with
`npm run verify` (typecheck + lint + footguns) — passes; the 4 lint warnings are
pre-existing `<img>` notices, unrelated to this change.

## 2026-09-05 — Redesign stock ledger as a full-width table (readability)

**What:** Replaced the narrow "receipt tape" rendering of the admin Stock Ledger
with a full-width, readable layout in `app/StoreApp.tsx` (`StockLedger`).
- Dropped the `max-w-md` receipt-strip wrapper that squeezed the ledger into a
  thin center column and left most of the admin page empty.
- Added a 4-up summary card row: Movements, Total In, Total Out, On Hand.
- Rendered movements in a real `<table>` with columns: Ref, Date/Time, Item
  (+ SKU), Reason, Qty, running Balance — zebra striping, a dark teal header,
  horizontal scroll on small screens, and a footer totals row.
- Kept the append-only semantics and the teal (+add) / coral (−remove) color
  coding; no data-model or logic change — still reads the mock `MOVEMENTS`
  array via the same running-balance reduce.

**Why:** User reported the ledger looked cramped/unreadable and used little
horizontal space. The receipt-tape styling was decorative but poor for scanning
many rows in the admin panel.

**Impact:** Presentation only; the `MOVEMENTS` seam and running-balance logic are
unchanged, so wiring the real `StockMovement` table later is unaffected. The
`.receipt-edge` CSS utility is now unused by this component (still defined in
`globals.css`; left in place). `npm run verify` passes (footguns clean; only the
4 pre-existing `<img>` lint warnings remain).

## 2026-09-05 — Make "verify once at the end" a hard rule + add efficiency lessons

**What:** Turned the "verify once" guidance into a mandate and recorded the
cost lessons from the UI restyle turn.
- `AGENTS.md`:
  - "Verification gate" section now states verification must run **exactly once,
    at the very end** of a task — never mid-task, per-file, per-sub-task, or "to
    be sure"; a green run is final. Running the gate repeatedly is not allowed.
  - The token-efficiency "Verify proportionally" bullet was rewritten to the same
    once-at-the-end mandate.
- `.kiro/skills/token-efficiency/SKILL.md`:
  - Verification section rewritten to the once-at-end rule, plus prep the
    toolchain separately (run `npm install` / confirm `npm run verify` up front;
    note the Windows `prisma generate` EPERM file-lock) so feature work doesn't
    spend budget discovering a broken toolchain.
  - New "Large files and big restyles" section: read each region of
    `app/StoreApp.tsx` once (don't re-read for line numbers — string-replace
    matches on content), lock design tokens up front to avoid mid-task retunes,
    split a whole-app restyle across fresh focused sessions, and prefer editing
    shared tokens/primitives over every call site.
  - Edits section: use `replace_all` for repeated token/class swaps; never use a
    literal `//` as JSX text (parses as a comment → `react/jsx-no-comment-textnodes`).

**Why:** Retro on the restyle turn found the big avoidable costs were repeated
re-reads of the 1200-line monolith, verifying after every task instead of once,
an on-the-clock toolchain detour, and an avoidable `//`-as-JSX-text lint loop.
Encoding these as rules makes the next run cheaper by default.

**Impact:** Docs/rules only — no code, schema, dependency, or scope changes.
Behavior change for agents: batch all edits, then verify a single time at the
end; treat large-file restyles as split, token-first, fresh-session work.

## 2026-09-05 — Soften the restyle to an oceanic palette (no hard black lines)

**What:** Follow-up tweak to the soft-brutalist restyle so the outlines read as
ocean, not near-black.
- `app/globals.css`: shifted `--ink` from near-black teal `#12343B` to a deep
  ocean navy-teal `#123C4A` (still high-contrast for text); added a new `--line`
  `#2C5D6E` softer ocean tone for structural outlines; cooled the canvas from
  warm paper to sea-mist (`--paper #F0F6F5`, `--paper-2 #E2EFED`, `--card
  #FBFDFC`); nudged `--muted` cooler; and added `--shadow-ink` (a translucent
  `rgb(18 60 74 / 0.5)`) so the flat offset shadows are soft ocean instead of
  opaque black.
- `app/StoreApp.tsx`: repointed every border/rule/divider (cards, tables, chips,
  dashed placeholders, receipt tape, sidebar) from `var(--ink)` to `var(--line)`,
  and every offset shadow from opaque `var(--ink)` to translucent
  `var(--shadow-ink)`. `--ink` now only backs text, solid fills, and the modal
  overlay — not lines.

**Why:** User said the near-black lines felt too hard and asked for a more oceany
look.

**Impact:** Visual only — no layout, behavior, data, or scope changes; the
brutalist structure (visible outlines + offset shadows) stays, just in softer
ocean tones. Verified once at the end: `npx tsc --noEmit` clean, `npm run
footguns` clean, `npm run lint` 0 errors (same 4 pre-existing `<img>` LCP
warnings).

## 2026-09-05 — Restyle the whole UI to a soft-brutalist / editorial look

**What:** Reskinned the entire prototype UI from the soft-aqua rounded-SaaS look
into a **brutalist-inspired / editorial** direction with an expanded but soft
palette. Visual/layout only — no data-model, Prisma, auth, money-math, or scope
changes. Touched `app/globals.css`, `app/StoreApp.tsx`, and `app/layout.tsx`
(title/description only).

- **Design tokens (`app/globals.css`):** replaced the old stylesheet with a
  token system as CSS variables — `--ink #12343B`, `--teal #2F8DA3`,
  `--teal-deep #1C4F5A`, `--aqua #9CEFE3`, `--coral #FF6B4A` (+ `--coral-ink
  #C7431F` for coral text on paper), `--marigold #F5B841`, `--plum #6B5B95`,
  `--paper #FBF6EC` / `--paper-2 #F3EADA`, `--muted #6E7E82`. New type roles:
  **Archivo Expanded** (display, `.font-display`), **Inter** (body, default),
  **Space Mono** (`.font-mono`, used for prices / order IDs / stock / the
  ledger). Structure tokens: near-zero radius, 2px ink borders, one flat offset
  shadow (`4px 4px 0 var(--ink)`). Added `.eyebrow` (mono uppercase label),
  `.receipt-edge` (CSS perforated mask for the ledger), a `:focus-visible` coral
  ring, and a `prefers-reduced-motion` block. **Removed** the old
  `animate-float`, `animate-ping-slow`, `shimmer` keyframes and `.shimmer-text`.
- **Primitives (`app/StoreApp.tsx`):** `Btn`, `Tag`, `Label`, `Divider`,
  `FieldInput`, `Card`, `ImgFrame`, `BrandLogo` restyled to the new language with
  all props/signatures unchanged, so every screen inherited most of the look.
- **Storefront:** editorial hero (oversized Archivo headline, mono eyebrow,
  coral CTA, one offset-shadow image block) replacing the gradient/SVG-wave/blur
  hero; squared category toggle chips; square product cards with mono coral
  prices; a bordered numbered "Why Choose" row; mono cart drawer.
- **Admin:** login, sidebar/mobile tabs (teal-deep + coral active), dashboard
  (mono stat values, squared bar chart, coral progress bars), inventory table
  (mono ruled rows, squared status filters — inline stock edit preserved), orders
  tab, and the Add-Product modal.
- **Signature — the stock ledger:** added a **Ledger** tab to the admin panel
  rendering a `StockLedger` "receipt tape" — mono, ruled/perforated, `+` entries
  in teal and `−` in coral, running balance and TOTAL IN / OUT / ON HAND. Driven
  by an in-file `MOVEMENTS` mock array (8 rows, including a compensating
  correction MV-0005 → MV-0006 to demo the append-only rule). A `// SEAM` comment
  marks where real `StockMovement` rows will connect. No float math; integer
  quantities only.
- **Remaining screens:** checkout (`PaymentView`), order tracking, about, and
  contact all reskinned; the `StoreApp` demo-nav bar updated to match.

**Why:** User asked to restyle the app into brutalism with soft colors, keeping
the teal seafood identity, and to make it look intentional rather than
AI-templated (used the `frontend-design` skill to steer the direction).

**Impact:** All existing behavior preserved — cart add/remove + delivery-fee
logic, storefront/inventory search & filters, inline stock editing, admin tab
switching, the Add-Product variant repeater, checkout flow, and order lookup all
still work. Money is still `₱{price}` display-only in this prototype (centavos
rule untouched). New fonts load from Google Fonts. The stock ledger is presently
mock data — wiring it to the real `StockMovement` table remains a separate,
already-tracked DB task. Verification: `npx tsc --noEmit` clean, `npm run
footguns` clean, `npm run lint` 0 errors (4 pre-existing `<img>` LCP warnings on
the logo/banner images remain, unchanged by this work). `npm run verify` as a
whole was not run end-to-end because `prisma generate` fails on this Windows box
with an EPERM file-lock (environment issue, unrelated to these edits); the three
gate steps were run individually instead.

## 2026-09-05 — Trim always-on agent context to cut token/credit usage

**What:**
- Changed steering inclusion so project facts stop double-loading every turn.
  `AGENTS.md` (already injected as a rule on every turn) stays the single
  always-on source of truth; the three steering files that duplicated it are no
  longer `inclusion: always`:
  - `.kiro/steering/product.md` → `inclusion: manual` (pull with `#product`).
  - `.kiro/steering/tech.md` → `inclusion: manual` (pull with `#tech`).
  - `.kiro/steering/structure.md` → `inclusion: fileMatch` on
    `app/** lib/** auth.ts auth.config.ts prisma/** *.config.*` (loads only when
    editing source; pull with `#structure` otherwise).
- Added a **"Token / credit efficiency"** section to `AGENTS.md` codifying agent
  behavior: reuse in-context facts, batch reads/searches, search narrow, prefer
  targeted edits over full-file rewrites, delegate big investigations to a
  sub-agent, verify once per logical unit, and load heavy references on demand.
- Added a new on-demand skill `.kiro/skills/token-efficiency/SKILL.md` with the
  same guidance so it activates only when relevant instead of loading every turn.

**Why:** User asked to make the agent more efficient with tokens/credits. The
three always-on steering files were largely a restatement of `AGENTS.md`, so the
same product/tech/structure facts were being paid for 2–4 times per turn (~8 KB
of duplicated always-on context).

**Impact:** No information lost — all facts still live in `AGENTS.md` and in the
now-conditional/manual files. Meaningfully smaller per-turn context. Behavior
change for agents: pull `#product` / `#tech` / `#structure` explicitly when
needed outside a code edit; `structure.md` auto-loads during source edits. No
code, schema, dependency, or scope changes.

## 2026-09-05 — Add Username field to admin login

**What:** Added the missing **Username** textbox to `AdminLogin` in
`app/StoreApp.tsx` (above the existing Password field), backed by a new `user`
state. The login check now requires both `user === "admin"` and
`pw === "admin123"`; the error message changed to "Incorrect username or
password." This matches the login card in the provided screenshot, which showed a
Username field the code did not yet render.

**Why:** User pointed out the screenshot's admin Username textbox was absent —
the demo hint listed "User: admin" but there was no field to enter it.

**Impact:** Prototype UI only — still fake client-side auth, not the real
NextAuth Credentials flow. No schema, dependency, or scope changes. Verified with
`getDiagnostics` (no errors; only pre-existing Tailwind v4 class warnings).

**What:** Two prototype-UI fixes in `app/StoreApp.tsx`:
- **Admin login (`AdminLogin`):** the demo-credentials hint now shows both the
  username and password ("Demo credentials · User: admin · Pass: admin123")
  instead of only the password.
- **Add New Product modal (`AddProductModal`):** replaced the single hardcoded
  "Variant 1" block (backed by four standalone `variantName`/`sku`/`price`/
  `stock` states) with a `variants` array of drafts. Added `addVariant`,
  `removeVariant`, and `updateVariant` handlers, made the SKU auto-suggest a
  per-variant `suggestSku(name)` function, and wired the "+ Add Another Variant"
  button so it actually appends a new variant card. Each extra card past the
  first gets a "Remove" control.

**Why:** User asked to surface the admin username on the login card and reported
that "+ Add Another Variant" did nothing — the button existed but there was no
state to add to.

**Impact:** Prototype UI only — still no persistence; Save Product continues to
just close the modal. No schema, dependency, or scope changes. Note prices are
still collected as plain peso strings in this mock form; the centavos-Int
conversion belongs to the real DB-backed save path when that gets built. Verified
with `getDiagnostics` (no errors; only pre-existing Tailwind v4 class warnings
elsewhere in the file).

**What:** Wired the previously inert `+ Add Product` button in the admin
Inventory tab (`app/StoreApp.tsx`) to open a new `AddProductModal` component. The
modal matches the intended design: a teal header ("Add New Product" + "Fill in
product details and at least one variant" + close X), a numbered **1 Product
Info** section (Product Name*, Category* select sourced from the current
inventory's categories, optional Description textarea, optional Product Photo
upload dropzone with "JPG, PNG, WEBP · max ~5 MB" hint), a numbered **2 Variants**
section labelled "Price & stock live here, not on the product" containing a
Variant 1 card (Variant Name*, SKU* with an "Auto-suggest SKU" helper that fills
a `HB-<CAT>-<NAME>-<VARIANT>` slug, Price (₱)*, Initial Stock), and a footer with
Cancel / Save Product. Added an `addOpen` state to toggle it.

**Why:** User asked to build out the current "Add New Product" flow to match the
provided screenshot of the modal.

**Impact:** Prototype UI only — consistent with the rest of the admin view,
nothing persists to the database yet (both Cancel and Save just close the modal).
No schema, dependency, or scope changes. Reuses existing primitives (`Btn`,
`FieldInput`, `Divider`, `Label`, `IcUpload`, `IcXCircle`) and the brand palette.
`npm run typecheck` and `npm run footguns` both pass; lint shows only pre-existing
warnings. Note: image upload is out of scope (`docs/scope.md` — placeholder URLs
only), so the photo dropzone is presentational and does not upload; the modal's
Save is a stub pending real product-CRUD server wiring.

## 2026-09-03 — Add GitHub Actions CI running the verify gate on push/PR

**What:** Added `.github/workflows/verify.yml` (the repo's first CI workflow). It
runs `npm run verify` (typecheck + lint + footgun scan) on Node 20 for every
push and pull request to `dev` and `master`. Uses `npm ci` with npm caching,
skips Git LFS on checkout (`lfs: false`), and cancels superseded runs on the same
ref. Added a "Continuous integration" section to `docs/deployment.md`.

**Why:** `AGENTS.md` already promised "CI still runs verify" as the backstop
behind the bypassable pre-commit hook, but no CI existed. This makes the
verification gate unbypassable on the shared branches.

**Impact:** No application code, schema, or dependency changes. Deliberately
excludes the DB-backed scripts (`smoke`/`check:ledger`/`check:data`/`stress`)
and `next build` — those need Supabase secrets, which is out of scope; Vercel
still owns deployment. The existing 4 `<img>` ESLint warnings stay non-blocking
(eslint exits 0). Optional follow-up: mark the "verify" check as required in
branch protection for `master`.

## 2026-09-03 — Reconcile dev with master (merge) and restore Git LFS rules in .gitattributes

**What:** Merged `origin/master` back into `dev` so the branches reconverge
(dev was 4 commits behind master), resolving an append-only conflict in
`docs/changelog.md` (all entries kept, newest-first). Also reconciled
`.gitattributes`: dev's copy had only the two git-hooks LF rules and was missing
master's ~130 lines of Git LFS tracking rules. The file now contains master's
full LFS ruleset **plus** the `githooks/* text eol=lf` and `*.sh text eol=lf`
lines, so neither side's config is lost when dev merges to master.

**Why:** After merging master into dev, dev's shorter `.gitattributes` would
have won and dropped the LFS rules on the next dev→master PR. LFS is actively in
use (the `imports/` and `public/imports/` Figma PNGs plus `.figma/attachments`
are LFS-tracked), so losing those rules would break binary-asset handling.

**Impact:** No application code, schema, or dependency changes. `.gitattributes`
now carries both concerns. `dev` is a clean superset of `master`; PR #3
(dev → master) should merge without conflict once `origin/dev` is updated.

## 2026-09-03 — Add universal code-quality verification gate (verify + footgun scan + pre-commit)

**What:** Added a tool-agnostic enforcement layer so the project's written
non-negotiables are checked mechanically, not just documented.
- `scripts/check-footguns.ts` — pure-Node static scanner (no deps, no DB). Flags:
  stray `new PrismaClient()` outside `lib/prisma.ts`; float/`parseFloat` money
  math; hard-delete of `product`/`productVariant`; any edit/delete of a
  `StockMovement` row. Exits non-zero on a hit; inline `// footgun-ok: <reason>`
  opts a line out.
- `package.json` scripts: `typecheck` (`tsc --noEmit`), `footguns`, and
  `verify` = `typecheck && lint && footguns`. Also `setup:hooks` and a
  `postinstall` step that self-activates the git hook.
- `githooks/pre-commit` (committed, POSIX sh) runs `npm run verify`; activated
  via `git config core.hooksPath githooks` through `scripts/setup-hooks.mjs`
  (guarded so it never fails an install outside a git repo). No husky.
- `.gitattributes` forces LF on `githooks/*` and `*.sh` so the hook doesn't
  break on Linux/CI with a CRLF interpreter error.
- Aligned the existing Kiro `PostFileSave` hook to run `npm run verify` (was
  bare `tsc --noEmit`), so the editor convenience layer reuses the same logic.
- Updated `AGENTS.md` with a "Verification gate" section and command list.

**Fixes made to reach a green gate (pre-existing issues the gate surfaced):**
- `eslint.config.mjs` now ignores `prototype_src/**`, `imports/**`,
  `public/imports/**` (legacy prototype + generated Figma assets; already out of
  tsconfig scope).
- `app/StoreApp.tsx`: added missing React `key` props (STEP_ICONS, STATUS_ICONS,
  order-details tuples), removed a duplicate unused `stockColor`, dropped an
  unused `idx` param, escaped an apostrophe.
- `auth.ts`: replaced an `as any` cast on `session.user.role` with a precise
  inline type (no behavior change).
- `prisma/seed.ts`: annotated the intentional wipe-and-reseed deletes with
  `// footgun-ok: seed reset` (option 2 — explicit exceptions over blanket
  exemption).

**Why:** Team asked whether skills/AGENTS.md could make the code better, and to
keep it universal rather than Kiro-only. Mechanical enforcement (a gate every
tool and teammate runs) improves code quality more than additional instruction
prose, and it turns the existing money/ledger/soft-delete/Prisma-singleton rules
into checks that actually block violations.

**Impact:** Run `npm run verify` before committing; it also runs automatically on
commit via the pre-commit hook (bypass with `git commit --no-verify`, discouraged
— CI still runs it). New rules go in `scripts/check-footguns.ts`. `npm run verify`
is currently green: typecheck clean, lint 0 errors (4 non-blocking `<img>`
warnings remain), footguns clean. No dependencies added; scope unchanged (no test
framework).

## 2026-09-03 — Add standalone dev verification scripts (smoke / ledger / data / stress)

**What:** Added a `scripts/` folder of hand-run operational checks (run via
`tsx`, no new dependencies) plus `npm` shortcuts. These are NOT an automated
test suite — the scope (`docs/scope.md`) excludes one — but standalone dev tools
in the same category as `prisma/seed.ts`. Files:
- `scripts/_report.ts` — shared `Report` helper (pass/fail/warn tally, peso
  formatter, non-zero exit on failure). Documents why these scripts use their
  own `PrismaClient` rather than the `server-only` `@/lib/prisma` singleton.
- `scripts/smoke.ts` — DB reachability, per-model row counts, and seed-health
  signals (warns when the DB looks empty / under-seeded vs the ~50-product target).
- `scripts/check-ledger.ts` — StockMovement invariants: no negative computed
  stock, no zero-quantity or reason-less movements, no orphaned rows. Also prints
  a movements-by-reason breakdown and on-hand inventory value.
- `scripts/check-data.ts` — money is non-negative integer centavos, stored
  `Order.totalCentavos` matches the sum of its items, `priceAtTime` is captured,
  active products have a variant, SKUs are non-empty, users have a hash/role and
  at least one ADMIN exists.
- `scripts/stress-connections.ts` — concurrent read-query load generator through
  one client; reports p50/p95/max latency and flags "Too many connections" /
  pool-exhaustion errors (the Supabase free-tier gotcha). Args: `[total] [conc]`.

`package.json` scripts added: `smoke`, `check:ledger`, `check:data`, `check:all`,
`stress`.

**Why:** Team asked for useful test-like scripts (smoke/stress/etc.) for
development. Framed as operational verification rather than a graded test suite
so it respects the frozen "manual verification only" scope while still guarding
the load-bearing invariants (the stock ledger above all).

**Impact:** All scripts are read-only against the DB (stress only reads) and safe
to run anytime after seeding, e.g. `npm run check:all` or `npm run stress -- 500 50`.
Each exits non-zero on failure, so they're usable from hooks or CI later. No app
code, schema, or dependency changes; `tsx` was already a devDependency. `scripts/`
is covered by `tsconfig` `**/*.ts` — `npx tsc --noEmit` passes. Scope unchanged
(no test framework added).

## 2026-09-03 — Replace admin inventory Low/Out toggle with real filters

**What:** Reworked the admin Inventory filter bar in `app/StoreApp.tsx`. The
single "Low / Out" boolean toggle is gone. In its place:
- A **category** dropdown (built from the distinct categories present in the
  inventory data, sorted, with an "All categories" default).
- A **stock-status** segmented control (All / In stock / Low / Out) whose dots
  reuse the same emerald/amber/red semantics as the table's status column, so
  the control visually mirrors the data it filters.
- A live "Showing X of Y" count, and a "Clear filters" link that appears only
  when a search term, category, or status filter is active.

Search, category, and status now compose (all three apply together). The
empty-state row copy was updated to point the user at clearing filters.

**Why:** Follow-up request — the previous filter (low/out only) was too narrow
to be useful for an admin scanning ~50 products across several categories.

**Impact:** Client-side only; no DB, schema, or dependency changes. Reuses the
brand palette and existing `FieldInput` primitive; adds a native `<select>` and
a segmented control (no new dependencies). `npx tsc --noEmit` passes; ESLint
reports only pre-existing issues unrelated to these edits. Replaces the
`lowStockOnly` state added in the prior entry with `invCategory` + `invStatus`.

## 2026-09-03 — Wire up storefront and admin product search + filter

**What:** Made the previously decorative search boxes and Filter button
functional in `app/StoreApp.tsx` (the prototype UI):
- **Storefront (`ClientView`)** — added a `search` state, bound the header
  search field's `value`/`onChange`, and combined it with the existing category
  filter so the product grid now filters by name or category substring (case-
  insensitive). The empty-state message now reflects a no-match search vs. an
  empty category.
- **Admin inventory (`AdminView`)** — added `invSearch` and `lowStockOnly`
  state, bound the "Search products…" field, and turned the inert "Filter"
  button into a toggle that limits the table to Low / Out-of-stock items. The
  inventory table renders the derived `filteredInventory` list and shows an
  empty-state row when nothing matches.

**Why:** User asked to "make the filter and search work" — both inputs rendered
but were `readOnly` with no state wired, and the admin Filter button did nothing.

**Impact:** Client-side only, still operating on the props-supplied product data
(no DB, schema, or dependency changes). `npx tsc --noEmit` passes; `npm run lint`
shows only pre-existing warnings/errors unrelated to these edits. No new
commands or migrations. Behavior is additive — existing category filtering is
unchanged.

## 2026-09-03 — Replace boilerplate README with project README

**What:** Rewrote `README.md`, which was still the stock `create-next-app`
boilerplate, into a Hook & Box project README: product summary, the stock
ledger, tech stack, getting-started (including the dual Supabase
`DATABASE_URL`/`DIRECT_URL` setup and `.env.local`), a commands table, the
money/stock/soft-delete/Prisma-singleton conventions, pointers to the
authoritative `docs/`, and the installed agent skills.

**Why:** The default README described none of this project; a real README helps
teammates and the panel get oriented and run the app correctly.

**Impact:** Documentation only; no code, schema, or dependencies changed.
Commands and env-var guidance mirror `package.json`, `.env.example`, and the
steering docs.

## 2026-09-03 — Install universal agent skills (frontend-design + hookandbox-stack)

**What:** Installed two workspace-scoped Agent Skills, each placed in all five
agent skill directories so they work across every AI tool the repo supports
(`.agents/`, `.claude/`, `.cursor/`, `.devin/`, and a newly created `.kiro/`):
- `frontend-design` — the official Anthropic skill (Apache 2.0; `SKILL.md` +
  `LICENSE.txt`) for distinctive, intentional UI that avoids generic "AI slop".
  Fetched verbatim from `github.com/anthropics/skills`.
- `hookandbox-stack` — a project-tailored skill authored from this repo's own
  files (`prisma/schema.prisma`, `lib/prisma.ts`, `auth.ts`, `auth.config.ts`,
  `.env.example`, `package.json`) and steering docs. Encodes the money-as-centavos,
  append-only StockMovement ledger, soft-delete, Prisma singleton, Next.js 16
  App Router, NextAuth v5 role-gating, and Supabase dual-connection-string rules.

**Why:** The team wanted installable skills that fit the stack and goal, plus a
UI/UX design skill — usable by any agent, not just Kiro, and scoped to this
project only.

**Impact:** New `.kiro/skills/` directory added. No application code, schema,
or dependencies changed — these are agent-guidance files. Skills auto-activate
by description/trigger when relevant work comes up. The `frontend-design` skill
carries its upstream Apache 2.0 `LICENSE.txt`; keep it alongside the `SKILL.md`.
Note: the pre-existing `prisma-composer` skill folders remain unused leftovers
(this project uses standard Prisma, not `@prisma/composer`).

## 2026-09-03 — Add hard rule requiring all changes to be documented

**What:** Added a "MANDATORY: document every change" section near the top of
`AGENTS.md`, reinforced it as a bullet in the "Non-negotiable rules" list, and
created this `docs/changelog.md` file as the required change log.

**Why:** The team wants a hard, enforceable rule so that no AI-made edit ever
ships undocumented — keeping `docs/` trustworthy for the prof check and defense.

**Impact:** From now on, every code/config/schema/dependency/script change must
add an entry here and update any affected topic doc (`data-model.md`,
`scope.md`, `deployment.md`, `project-overview.md`) in the same turn. A change
is not complete until its documentation exists.

## 2026-09-03 — Add plain-language project overview

**What:** Created `docs/project-overview.md`, a beginner-friendly guide to the
whole project (product summary, the stock ledger, the seven entities, common
prof questions, out-of-scope items, tools, repo tour, demo script, glossary).

**Why:** So a team member who isn't strong in coding can confidently explain and
defend the project during the professor's check.

**Impact:** New documentation only; no code changed.
## 2026-09-05 — Shift UI from soft-brutalist to quiet editorial

**What:** Reworked the visual language away from the neo-brutalist look (sharp
corners, thick 2px ink borders, hard stamped offset shadows) toward a softer
editorial style with rounded corners, hairline borders, and diffuse shadows.
- `app/globals.css`:
  - Retuned tokens: `--radius` 3px → 14px, added `--radius-sm` (10px) and
    `--radius-lg` (20px); `--line` is now a low-opacity hairline
    (`rgb(18 60 74 / 0.14)`) with a firmer `--line-strong`; `--border-w` 2px → 1px.
  - `--shadow-hard`/`-sm`/`-coral` changed from square `Npx Npx 0` offsets to
    soft diffuse lifts; `--shadow-ink` kept as a legacy alias.
  - Added a "quiet-editorial normalization" layer that thins any inline
    `border-2` to 1px hairline and rewrites hard offset shadows
    (`shadow-[Npx_Npx_0_...]`) to the soft lift, so the many inline call sites
    soften without editing each one. Scrollbar thumb is now pill-rounded.
  - Softened the brutalist "press into the shadow" active nudge to a 1px dip.
- `app/StoreApp.tsx`:
  - `Btn` (pill-rounded, hairline/transparent borders, soft/coral shadow),
    `Tag` (pill), `FieldInput` (rounded, teal focus border), `Card`, `Divider`,
    `ImgFrame` now use the new radius/border tokens.
  - Rounded the header search/menu/cart buttons and the category filter pills.
  - Updated the design-system comment header to describe the editorial system.

**Why:** User felt the UI still read as standard neo-brutalism (harsh lines);
asked to round corners and reduce/soften stroke width toward an editorial layout
without harsh outlines. Direction informed by current "barely-there / editorial
minimalist" web-design trends (hairline borders, rounding, structure from type
and whitespace). Content rephrased for compliance with licensing restrictions.

**Impact:** Purely visual — no logic, data, or schema changes. All screens
share the primitives + token layer, so the whole app restyles at once. The
global normalization layer means future inline `border-2`/offset-shadow usages
will also auto-soften. No new commands or migrations.
