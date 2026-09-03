# Logo PNG Integration

## Context
User manually added 4 PNG assets to `src/imports/`. These are the actual brand logo assets. The current `BrandLogo` component is text-only (Russo One font). These PNGs need to be imported and placed appropriately throughout the app.

## Assets identified
| File | Contents | Background |
|---|---|---|
| `Vector.png` | Isometric 3D "J" hook icon (the brand mark) | Transparent/white |
| `Frame_15.png` | Full lockup: icon + "HOOK&BOX" text | Teal (#419DB2) |
| `Frame_15-1.png` | Icon only (the "J" hook) centered | Teal (#419DB2) |
| `Frame_19.png` | "HOOK&BOX" text only | Teal (#419DB2) |

## Changes to make in `src/App.tsx`

### 1. Add 4 ES module imports (after existing imports, lines 1–2)
```tsx
import vectorLogo from "@/imports/Vector.png";
import frame15Logo from "@/imports/Frame_15.png";
import frame151Logo from "@/imports/Frame_15-1.png";
import frame19Logo from "@/imports/Frame_19.png";
```

### 2. Update `BrandLogo` component (lines 82–89)
Add the `vectorLogo` icon image to the left of the text. `Vector.png` has a transparent/white background so it works on any surface.
```tsx
function BrandLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconCls = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-12 w-12" : "h-8 w-8";
  const textCls = size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-xl";
  return (
    <span className={`inline-flex items-center gap-2 font-['Russo_One'] ${textCls} tracking-tight`}>
      <img src={vectorLogo} alt="" className={`${iconCls} object-contain`} />
      <span><span className="text-[#3899AE]">Hook&</span><span className="text-[#9CEFE3]">Box</span></span>
    </span>
  );
}
```
This propagates the real icon to **all 8 placements** of `BrandLogo` (nav, admin sidebar, admin login, payment header, track header, about header, about card, contact header) with no other changes needed.

### 3. AboutView: replace Frame15 TSX banner with `Frame_15.png` (lines 959–961)
```tsx
{/* Logo splash banner */}
<div className="h-40 overflow-hidden relative">
  <img src={frame15Logo} alt="Hook & Box" className="w-full h-full object-cover object-center" />
</div>
```
`Frame_15.png` is the full lockup on a teal background — identical visual result to the TSX component, but a real PNG. Can also remove the `Frame15` TSX import from line 2 once replaced.

### 4. ClientView hero: add `Frame_15-1.png` as right-side hero decoration
In the hero `<section>`, the right side currently has no visual. Add the icon image there:
```tsx
<img src={frame151Logo} alt="" aria-hidden="true"
  className="hidden md:block h-40 w-auto opacity-80 object-contain" />
```
The icon-on-teal blends naturally into the teal hero background, giving the hero a branded visual without needing a separate illustration.

### 5. `Frame_19.png` placement
Use as a decorative text-logo stamp inside the "Est. 2026" / brand card in AboutView's main content section. Replace or augment the large `<BrandLogo size="lg" />` there:
```tsx
<img src={frame19Logo} alt="Hook & Box" className="h-20 w-auto mx-auto object-contain rounded-xl" />
```

## Files to modify
- `src/App.tsx` only — add 4 imports, update `BrandLogo`, update AboutView banner, update ClientView hero, update AboutView brand card.

## Verification
- Nav shows 3D hook icon + "Hook&Box" text on white background
- Admin sidebar and admin login card show icon + text
- About page banner shows full teal logo lockup (Frame_15)
- Hero right side shows the icon on teal (Frame_15-1) on desktop
- About brand card shows Frame_19 text logo
- No broken image `<img>` tags (all imported as ES modules, not string paths)

---

# Wireframe → Prototype Transition

## What we already have (no action needed from you)
| Asset | Status |
|---|---|
| Hook & Box logo (SVG from Figma) | ✅ Ready — `src/imports/Frame15/index.tsx` |
| Brand colors (#3CB3CA teal, #9CEFE3 mint) | ✅ Confirmed from Figma import |
| All product names, categories, prices | ✅ In wireframe already |
| All page structures (6 views) | ✅ Wireframe complete |
| Seafood product photos | ✅ Unsplash URLs already sourced |
| Lalamove badge / COD / GCash flow | ✅ Wireframe complete |

## What I need from you

### Confirmed ✅
1. **Color palette** — confirmed:
   - `#3899AE` / `#419DB2` / `#85CDDB` — primary teal range
   - `#9CEFE3` — mint accent (matches Figma logo)
   - `#DFF3F5` — light teal surface / background tint
   - `#FFFFFF` — white
2. **Font** — **Russo One** (Google Fonts, same as wireframe) until Komu New file is ready
3. **Prices** — keep current wireframe prices as-is
4. **Product images** — empty frames only; team will add photos manually later

### Still pending (send when ready — prototype works without them)
- Facebook page URL → contact page "Visit Page" button
- Phone / SMS number → contact page + checkout confirmation
- Team photos (Pam, Ichan, Chels, Kiel, EJ) → About page

### Not needed
- Lalamove API, GCash API, SMS service, backend/database — all mockup only

## All decisions confirmed ✅
- **Admin gate**: simple password login — password: `admin123`
- **Delivery details**: Min ₱200 · Fee ₱50 (free above ₱500) · Cutoff 9 PM · Mon–Sat 6 AM–12 PM
- **Coverage**: "Dasmariñas City" (barangays to be added later)
- **Contact info / team photos**: placeholders for now

---

# Prototype Build Plan

## Goal
Transition the wireframe into a visually styled prototype using the confirmed brand palette, Russo One display font, and the existing Figma logo SVG. All 6 views get the full color treatment. Structure and logic stays the same — only visuals change.

## Color token mapping
| Token | Hex | Usage |
|---|---|---|
| Primary | `#3899AE` | Buttons (filled), active nav, borders |
| Primary mid | `#419DB2` | Hover states |
| Primary light | `#85CDDB` | Secondary buttons, progress steps done |
| Accent | `#9CEFE3` | Tags, badges, highlights |
| Surface | `#DFF3F5` | Card backgrounds, section tints, hero bg |
| White | `#FFFFFF` | Page bg, nav, modals |
| Text dark | `#1C4F5A` | Headings |
| Text mid | `#3A6B76` | Body text |
| Text muted | `#7AACB8` | Labels, captions, placeholders |
| Border | `#B8E4EC` | Card borders, dividers |

## Typography
- **Display / headings**: `Russo One` (Google Fonts) — nav brand name, page titles, hero
- **Body**: `Poppins` (Google Fonts) — all UI text, labels, descriptions
- Wire both in `src/index.css` via Google Fonts `@import`

## Key visual changes per area

### Global
- Page background: `#DFF3F5` (light teal surface)
- Nav: white with `#B8E4EC` border-bottom, brand name in Russo One + `#3899AE`
- Buttons (filled): `#3899AE` bg, white text; hover `#419DB2`
- Buttons (outline): white bg, `#3899AE` border + text
- Tags/badges: `#9CEFE3` bg, `#1C4F5A` text
- Dividers: `#B8E4EC`

### Logo in nav
- Render `<Frame15 />` from `src/imports/Frame15/index.tsx` scaled down as the nav logo, replacing the `[Logo]` WBox placeholder

### Client view
- Hero: `#3899AE` background, white headline text
- Category pills: active = `#3899AE` filled; inactive = white + `#3899AE` border
- Product cards: white bg, `#B8E4EC` border, `#DFF3F5` image frame
- "Why Choose" cards: `#DFF3F5` bg with `#3899AE` icon accent

### Admin view
- Sidebar: `#1C4F5A` dark teal bg, white text, active item `#3899AE`
- Stat cards: white bg, `#3899AE` value text
- Low-stock banner: `#FFF3CD` / amber (keep as-is for visibility)
- Password gate screen: centered card on `#DFF3F5` bg

### Payment / Track / About / Contact
- Step indicators: completed = `#3899AE` filled, current = `#3899AE` outline, future = `#B8E4EC`
- Section cards: white bg, `#B8E4EC` border
- About Est. 2026 stamp: `#3899AE` border, `#85CDDB` text

## Admin password gate
Add a `LoginScreen` component shown when `view === "admin"` and `!adminUnlocked`:
- Centered card on `#DFF3F5` background
- Logo, "Admin Login" heading
- Password input (type="password") + Login button
- Hardcoded check: `password === "admin123"` → set `adminUnlocked = true`
- Wrong password shows: "Incorrect password. Please try again."
- Add `adminUnlocked` state to root `App`, passed into `AdminView`

## Files to modify
- `src/index.css` — add Google Fonts imports (Russo One + Poppins), font-family defaults
- `src/App.tsx` — apply brand colors/typography throughout, add admin password gate, replace nav `[Logo]` WBox with `<Frame15 />` scaled

## Verification
- Client view: teal nav, hero, and buttons visible; product cards styled
- Admin: password gate shows first; "admin123" unlocks dashboard
- Payment: colored step indicators, teal buttons
- Track, About, Contact: branded colors applied throughout

---

# Plan: Track Order Page

## Context
The wireframe currently has a "Track Order" link in the client nav and a "Track My Order" button on the confirmation screen — both are unconnected. The user wants a simple Track Order view added so customers can check their order status using their Order ID.

## Removals
- **"How It Works" strip** — remove the 4-step strip in `ClientView` (the section between the hero banner and the category tabs, lines ~194–205 in App.tsx).

## Recommended additions (keep it simple)

Three elements only:

1. **Order ID lookup** — a single text input + "Track" button. The customer types their order ID (e.g. `#HB-003`) and submits.

2. **Status progress bar** — a horizontal 4-step strip showing the order's current stage. The four steps match the existing `ORDERS` statuses:
   - Pending → Confirmed → Out for Delivery → Delivered
   - Completed steps filled dark; current step highlighted; future steps grey.

3. **Order summary card** — below the tracker, a minimal card showing:
   - Order ID, date placed, payment method
   - Items ordered
   - Total amount
   - Estimated delivery note
   - **Courier: Lalamove** label (badge/tag)
   - A greyed-out "View on Lalamove" button with a note: *(Live tracking available once dispatched)* — no API call, just a placeholder to show where real Lalamove tracking would link in production.

That's it. No login, no history list, no map — just lookup → status → summary.

## Lalamove courier (no API — mockup only)
- The Lalamove API is not available for this mini thesis prototype.
- Show "Delivered by Lalamove" as a static courier badge on the order card.
- Include a disabled/greyed `[ View on Lalamove ]` button that in production would deep-link to the Lalamove booking. A small note underneath reads: *"Live tracking available once your order is out for delivery."*
- No map, no webhook, no real-time updates — the status shown is purely based on the admin-managed order status from the `ORDERS` data.

## What to wire up
- Add `"track"` to the `View` union type in `App`.
- Add a "Track Order" button in the top switcher bar (same pattern as the other 3 views).
- Wire the "Track Order" nav link in `ClientView` to `setView("track")` via a new `onTrack` prop.
- Wire the "Track My Order" button in `PaymentView` step 4 similarly.
- Create a `TrackOrderView` component in `App.tsx` (same file, same pattern as the other views) using existing primitives: `WInput`, `WBtn`, `WLabel`, `WDivider`, `WTag`.
- Look up the entered ID against the existing `ORDERS` constant; show "Order not found" if no match.

---

## About Page

Simple single-scroll section. Recommended content:

1. **Brand mark + tagline** — Hook & Box logo placeholder, short one-liner (e.g. *"Fresh seafood, delivered to your door in Dasmariñas."*)
2. **Our Story blurb** — 2–3 short sentences: five friends who wanted a convenient way to get fresh seafood without the hassle of going to the market.
3. **The Team — PICKE** — all 5 members in a single horizontal row (no wrapping to a second line):
   - Pam · Ichan · Chels · Kiel · EJ — in that order, all on one line
   - Each card: avatar box, name, a short fun role label (e.g. "The Negotiator", "The Chef Brain", etc. — lightly playful)
   - Use `flex flex-nowrap` with equal `flex-1` cards so all 5 fit in one row on desktop; allow horizontal scroll on mobile
4. **Est. 2026 badge** — a simple centered stamp/tag at the bottom of the section.
5. No contact form, no socials, no fluff — just the story + team + year.

## Wire-up for About
- Add `"about"` to the `View` union type.
- Add "About" button to the top switcher bar.
- Wire the "About" nav link in `ClientView` to `setView("about")` via a new `onAbout` prop.
- Create `AboutView` component in `App.tsx` using existing primitives.

---

## Contact Page

Simple two-column layout:

**Left — Contact Details**
- Facebook page placeholder (label: "fb.com/hookandbox" with a `[ Visit Page ]` button — no real link needed for mockup)
- Phone / SMS number placeholder (e.g. 0917-XXX-XXXX)
- Operating hours (e.g. Mon–Sat, 7:00 AM – 9:00 PM)
- Service area note: *"Currently delivering within Dasmariñas City only."*

**Right — Message Form (wireframe only, no backend)**
- Name input
- Phone number input
- Message textarea
- `[ Send Message ]` button (filled, no submit logic needed)

## Wire-up for Contact
- Add `"contact"` to the `View` union type.
- Wire the "Contact" nav link in `ClientView` to `setView("contact")` via the same nav prop pattern.
- Create `ContactView` component in `App.tsx` using existing primitives (`WInput`, `WBtn`, `WLabel`, `WDivider`).

---

---

## Replace "Delivery Coverage & Info" section

Remove the delivery map + info table at the bottom of `ClientView`. Replace it with a **"Why Choose Hook & Box?"** strip — 3 simple benefit cards in a row:

1. **No Market Trips** — Order from home, skip the commute
2. **Fresh Daily Catch** — Sourced fresh every morning
3. **Fast Lalamove Delivery** — Delivered straight to your door

Each card: a small placeholder icon box + a short heading + one-liner. Clean, scannable, no extra data. This keeps the bottom of the shop page feeling complete without the map placeholder.

---

## Mobile Responsiveness

Make all views work on mobile screens (≥320px) as well as desktop. Key changes per view:

### Global / top switcher bar
- Already has `overflow-x-auto` — confirm it scrolls horizontally on small screens without wrapping.

### ClientView
- **Nav**: Hide the desktop link row (`hidden md:flex`) — add a hamburger menu button visible on mobile that toggles a dropdown showing About / Track Order / Contact links.
- **Hero**: Already `flex-col md:flex-row` — verify stacking looks right on mobile.
- **Product grid**: Already `grid-cols-2 md:grid-cols-4` — good as-is.
- **Cart drawer**: On mobile, make it full-width overlay (`fixed inset-0` on small screens) instead of a side panel.
- **"Why Choose" strip**: Stack cards vertically on mobile (`flex-col md:flex-row`).

### AdminView
- **Sidebar**: On mobile, hide the sidebar and show a horizontal tab strip at the top instead (`flex md:hidden` toggle).
- **Inventory table**: Wrap in `overflow-x-auto` so it scrolls horizontally on small screens.
- **Dashboard stat cards**: Already `grid-cols-2 md:grid-cols-4` — good as-is.

### PaymentView
- **Step indicators**: Shrink labels to show only numbers on very small screens (hide text labels below `sm:`).
- **Two-column body**: Already `flex-col md:flex-row` — verify the price sidebar stacks below on mobile.
- **Delivery time buttons**: Allow wrapping.

### TrackOrderView / AboutView / ContactView
- Already `max-w-xl/2xl mx-auto` — confirm they don't overflow on narrow screens.
- **Contact two-column**: Already `flex-col md:flex-row` — good.
- **Team cards**: Already `flex-wrap` — good.

---

---

## Fixes needed

### 1. Delivery Info form in checkout — keep it, relabel it for Lalamove

The customer's address is still required — Lalamove needs a pickup and dropoff address. So Step 2 (Delivery Info) stays. Changes:
- Add a small note under the form header: *"Your address will be used to book your Lalamove delivery."*
- Add a read-only "Courier" field showing "Lalamove" so the customer sees who will deliver.
- Remove any implication that the business manages delivery themselves.

### 2. Lalamove — make it more visible in the checkout flow

Currently Lalamove only appears on the Track Order page. Add it to the checkout too:
- **Step 2 (Delivery Info)**: Add the Lalamove courier badge/note as described above.
- **Step 4 (Confirmation)**: Already shows `<WTag label="Lalamove" />` on the Courier row — verify this is rendering. Add a note: *"Our team will book your Lalamove pickup once your order is confirmed."*

### 3. Step 4 (Confirmation) silently fails when no payment method is selected

The "Place Order →" button uses `if (method) setStep(4)` — if the user hasn't picked GCash or COD, nothing happens and there's no feedback.

Fix: Show a visible inline error message below the button when the user clicks it without selecting a method. Change the condition to set an error state and display: *"Please select a payment method to continue."*

```tsx
// Add to PaymentView state:
const [payError, setPayError] = useState(false);

// Button onClick:
onClick={() => {
  if (method) { setPayError(false); setStep(4); }
  else setPayError(true);
}}

// Below the button:
{payError && <p className="text-xs text-[#F44336] mt-2">Please select a payment method to continue.</p>}
```

---

## Files to modify
- `src/App.tsx` — only file that needs changes.

## Verification
- **Track Order**: Type `#HB-003` → status bar highlights "Out for Delivery", Lalamove button enabled. Fake ID → "Order not found."
- **About**: PICKE team cards + Est. 2026 badge visible.
- **Checkout Step 2**: Lalamove badge/note visible in delivery info form.
- **Checkout Step 3**: Click "Place Order" without selecting a method → red error message appears. Select GCash or COD → error clears, advances to Step 4.
- **Checkout Step 4**: Lalamove tag visible on Courier row, booking note visible.
- **Mobile**: Resize to ~375px — all views responsive.
