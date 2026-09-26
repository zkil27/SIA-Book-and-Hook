"use client";
import { useState } from "react";
const vectorLogo = "/imports/Vector.png";
const frame15Logo = "/imports/Frame_15.png";
const frame151Logo = "/imports/Frame_15-1.png";
const frame19Logo = "/imports/Frame_19.png";

// ─── Design system: Logo-matched (teal / cyan / mint) ───────────────────────────
// Tokens live in app/globals.css as CSS variables — use them, don't hardcode hex.
//   --ink #103A45      text + hairline outlines + MONEY/prices (mono, neutral data)
//   --teal #34A6BD     brand primary   --teal-deep #1C6E80  admin chrome / dark bands
//   --cyan #58C6DB     bright logo cyan: secondary highlights / brand "Box" / data viz
//   --aqua #B7ECEB     logo mint fill: highlights / tags
//   --accent #FF7A4D   complementary warm pop — primary CTA + true alerts ONLY
//                      (--accent-ink #C7431F for accent text on paper)
//   --marigold #F5B841 low stock / warnings          --plum #6B5B95  tertiary variety
//   --paper #EAF6F6 / --paper-2 #D8EEEE  mint-tinted canvas   --card #F8FDFD  surfaces
//   NOTE: --coral/--coral-ink/--shadow-coral are legacy aliases → --accent* (kept for
//   the remaining CTA/alert call sites; brand + money were moved off them in the reskin).
// Type: font-display (Archivo Expanded) · body Inter · font-mono (Space Mono) for data/prices/IDs.
// Structure: rounded surfaces (--radius/-sm/-lg), hairline --line borders, soft diffuse
// shadows (--shadow-hard/-sm/-accent). Boldness lives in the warm accent + type, not strokes.

// ─── Icons ────────────────────────────────────────────────────────────────────

type Ic = { size?: number; className?: string };

function IcCart({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 2H4l2.2 9.5A1.8 1.8 0 0 0 8 13h7.5a1.8 1.8 0 0 0 1.75-1.4L18.5 6H5"/><circle cx="8.5" cy="17" r="1.2" fill="currentColor" stroke="none"/><circle cx="14.5" cy="17" r="1.2" fill="currentColor" stroke="none"/></svg>;
}
function IcGear({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="3"/><path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.2 4.2l1.5 1.5m8.6 8.6 1.5 1.5M4.2 15.8l1.5-1.5m8.6-8.6 1.5-1.5"/></svg>;
}
function IcSearch({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m12.5 12.5 4.5 4.5"/></svg>;
}
function IcPhone({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 3a1 1 0 0 1 1-.9h2.5l1.2 3-1.8 1.5a9 9 0 0 0 4 4L12 9l3 1.2v2.5a1 1 0 0 1-.9 1A11.5 11.5 0 0 1 3.5 3Z"/></svg>;
}
function IcUsers({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="6" r="3"/><path d="M1.5 18a6 6 0 0 1 12 0M13.5 4a3 3 0 1 1 0 6M18.5 18a5 5 0 0 0-5-5"/></svg>;
}
function IcCard({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="4.5" width="17" height="11" rx="1.5"/><path d="M1.5 8.5h17M5 13h3"/></svg>;
}
function IcMenu({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 5h14M3 10h14M3 15h14"/></svg>;
}
function IcFish({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 10a6.5 6.5 0 0 1-9 5.5C4 14 4 12 4 10s0-4 1.5-5.5A6.5 6.5 0 0 1 14.5 10Z"/><path d="M14.5 10 19 6.5v7L14.5 10Z"/><circle cx="7" cy="9" r="1" fill="currentColor" stroke="none"/></svg>;
}
function IcTruck({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="11" height="8" rx="1"/><path d="M12 8.5h4l2 3v2.5h-6V8.5Z"/><circle cx="4.5" cy="15.5" r="1.5"/><circle cx="14.5" cy="15.5" r="1.5"/></svg>;
}
function IcWarning({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2 2.5 17h15L10 2Z"/><path d="M10 8v4"/><circle cx="10" cy="14.5" r=".8" fill="currentColor" stroke="none"/></svg>;
}
function IcDoc({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="12" height="16" rx="1.5"/><path d="M7 7h6M7 10h6M7 13h3"/></svg>;
}
function IcPeso({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M5 4h6a4 4 0 0 1 0 8H5M5 8h8M5 12h8M5 4v13"/></svg>;
}
function IcClock({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 2"/></svg>;
}
function IcCheckCircle({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8"/><path d="m6 10 3 3 5-6"/></svg>;
}
function IcXCircle({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><path d="m7 7 6 6m0-6-6 6"/></svg>;
}
function IcUpload({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13V4M6.5 7.5 10 4l3.5 3.5"/><path d="M4 16h12"/></svg>;
}
function IcFacebook({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M18 10a8 8 0 1 0-9.25 7.9v-5.6H6.75V10h2V8.25C8.75 6.3 9.9 5.2 11.68 5.2c.88 0 1.82.15 1.82.15v2h-1.02c-1.01 0-1.32.63-1.32 1.27V10h2.25l-.36 2.3H11.16v5.6A8 8 0 0 0 18 10Z"/></svg>;
}
function IcBox({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7.5l8 4 8-4M10 11.5v7M3.5 5.5l6.5-3 6.5 3-6.5 3-6.5-3Z"/></svg>;
}
function IcGcash({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="6" height="6" rx=".5"/><rect x="12" y="2" width="6" height="6" rx=".5"/><rect x="2" y="12" width="6" height="6" rx=".5"/><rect x="3.5" y="3.5" width="3" height="3" rx=".3" fill="currentColor" stroke="none"/><rect x="13.5" y="3.5" width="3" height="3" rx=".3" fill="currentColor" stroke="none"/><rect x="3.5" y="13.5" width="3" height="3" rx=".3" fill="currentColor" stroke="none"/><path d="M13 13h5M13 15.5h3M13 18h5M16 13v5"/></svg>;
}
function IcCash({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="5.5" width="17" height="9" rx="1.5"/><circle cx="10" cy="10" r="2.5"/><path d="M5 8.5v3M15 8.5v3"/></svg>;
}
function IcHome({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 9 10 2l7.5 7"/><path d="M4.5 7.5V17h4v-4h3v4h4V7.5"/></svg>;
}
function IcChart({ size = 16, className = "" }: Ic) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 16h16M5 16V11M10 16V7M15 16V4"/></svg>;
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Btn({
  label, filled = false, outline = false, small = false,
  onClick, active = false, disabled = false, white = false, full = false,
}: {
  label: string; filled?: boolean; outline?: boolean; small?: boolean;
  onClick?: () => void; active?: boolean; disabled?: boolean; white?: boolean; full?: boolean;
}) {
  // Quiet-editorial buttons: pill-rounded, hairline outline, soft diffuse lift
  // on the primary (filled) action only — boldness lives in coral, not strokes.
  const sz = small ? "px-3.5 py-1.5 text-xs" : "px-5 py-2.5 text-sm";
  const w = full ? "w-full" : "";
  const base = `${sz} ${w} rounded-[var(--radius-sm)] font-semibold uppercase tracking-wide transition-all active:translate-y-[1px]`;
  if (disabled)
    return <button disabled className={`${sz} ${w} rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--paper-2)] text-[color:var(--muted)] font-semibold uppercase tracking-wide cursor-not-allowed`}>{label}</button>;
  if (white)
    return <button onClick={onClick} className={`${base} bg-[color:var(--paper)] text-[color:var(--ink)] border border-[color:var(--line)] shadow-[var(--shadow-hard-sm)] hover:bg-white`}>{label}</button>;
  if (filled || active)
    return <button onClick={onClick} className={`${base} bg-[color:var(--coral)] text-white border border-transparent shadow-[var(--shadow-coral)] hover:brightness-105`}>{label}</button>;
  if (outline)
    return <button onClick={onClick} className={`${base} bg-transparent text-white border border-white/60 hover:bg-white/10`}>{label}</button>;
  return <button onClick={onClick} className={`${base} bg-white text-[color:var(--ink)] border border-[color:var(--line)] hover:bg-[color:var(--paper-2)]`}>{label}</button>;
}

function Tag({ label, color = "accent" }: { label: string; color?: "accent" | "white" | "muted" }) {
  const base = "inline-block text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider font-mono rounded-full border";
  if (color === "white")
    return <span className={`${base} bg-white/15 text-white border-white/40`}>{label}</span>;
  if (color === "muted")
    return <span className={`${base} bg-transparent text-[color:var(--muted)] border-[color:var(--line)]`}>{label}</span>;
  return <span className={`${base} bg-[color:var(--aqua)] text-[color:var(--ink)] border-transparent`}>{label}</span>;
}

function Label({ children, sub = false }: { children: React.ReactNode; sub?: boolean }) {
  if (sub) return <span className="text-[11px] text-[color:var(--muted)] font-mono">{children}</span>;
  return <span className="eyebrow font-bold text-[color:var(--ink)]">{children}</span>;
}

function Divider() {
  return <div className="w-full border-t border-[color:var(--line)] my-4" />;
}

function FieldInput({ placeholder, value, onChange, type = "text" }: {
  placeholder: string; value?: string; onChange?: (v: string) => void; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange?.(e.target.value)}
      readOnly={!onChange} placeholder={placeholder}
      className="w-full border border-[color:var(--line)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm text-[color:var(--ink)] placeholder-[color:var(--muted)] bg-white outline-none focus:border-[color:var(--teal)] focus:shadow-[var(--shadow-hard-sm)] transition-all" />
  );
}

function ImgFrame({ label, aspect = "aspect-[4/3]" }: { label?: string; aspect?: string }) {
  return (
    <div className={`w-full ${aspect} bg-[color:var(--paper-2)] border-b border-[color:var(--line)] flex flex-col items-center justify-center gap-1.5 relative overflow-hidden`}>
      <div className="text-[color:var(--teal)]"><IcFish size={34} /></div>
      {label && <span className="text-[10px] text-[color:var(--muted)] font-mono uppercase tracking-wide text-center px-3 leading-tight">{label}</span>}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-[color:var(--card)] border border-[color:var(--line)] rounded-[var(--radius)] ${className}`}>{children}</div>;
}

function BrandLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconCls = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-12 w-12" : "h-8 w-8";
  const textCls = size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-xl";
  return (
    <span className={`inline-flex items-center gap-2 font-display font-extrabold ${textCls} tracking-tight`}>
      <img src={vectorLogo} alt="" className={`${iconCls} object-contain`} />
      <span><span className="text-[color:var(--teal)]">Hook&</span><span className="text-[color:var(--cyan)]">Box</span></span>
    </span>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

// Product & category data now come from the database via props (see lib/products.ts
// and app/page.tsx). These types describe the shape the UI consumes.
type Product = {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number; // pesos
  unit: string;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
};
type Category = { name: string; slug: string };

// Admin order list / order tracker still use demo order data for now (real order
// wiring is a later task; creating orders from checkout is in scope but not yet
// implemented server-side).
const ORDERS = [
  { id: "#HB-001", customer: "Maria Santos", items: "Bangus 2kg, Hipon 1kg", total: 710, status: "Pending", date: "Sep 1, 2026", payment: "GCash" },
  { id: "#HB-002", customer: "Jose Reyes", items: "Pusit 1.5kg, Tilapia 2kg", total: 720, status: "Confirmed", date: "Sep 1, 2026", payment: "COD" },
  { id: "#HB-003", customer: "Ana Cruz", items: "Alimango 1kg", total: 650, status: "Out for Delivery", date: "Aug 31, 2026", payment: "GCash" },
  { id: "#HB-004", customer: "Pedro Lim", items: "Alimasag 2kg, Tahong 500g", total: 960, status: "Delivered", date: "Aug 30, 2026", payment: "GCash" },
];

// Stock movement ledger — the append-only audit trail (the demo centerpiece).
// SEAM: this is representative mock data. When the real StockMovement table is
// wired, replace MOVEMENTS with rows from the DB (variant, quantity, reason,
// createdAt) passed in as a prop — quantities are integers, +add / −remove,
// and rows are NEVER edited: a correction is a new compensating movement.
type Movement = { id: string; sku: string; item: string; qty: number; reason: string; at: string };
const MOVEMENTS: Movement[] = [
  { id: "MV-0001", sku: "HB-FIS-BANGUS-1KG", item: "Bangus 1kg", qty: 120, reason: "Initial stock", at: "Aug 28 · 08:12" },
  { id: "MV-0002", sku: "HB-CRU-HIPON-1KG", item: "Hipon 1kg", qty: 60, reason: "Initial stock", at: "Aug 28 · 08:15" },
  { id: "MV-0003", sku: "HB-FIS-BANGUS-1KG", item: "Bangus 1kg", qty: -2, reason: "Order #HB-001", at: "Sep 01 · 09:41" },
  { id: "MV-0004", sku: "HB-CRU-HIPON-1KG", item: "Hipon 1kg", qty: -1, reason: "Order #HB-001", at: "Sep 01 · 09:41" },
  { id: "MV-0005", sku: "HB-FIS-BANGUS-1KG", item: "Bangus 1kg", qty: -5, reason: "Spoilage — damaged in transit", at: "Sep 02 · 17:03" },
  { id: "MV-0006", sku: "HB-FIS-BANGUS-1KG", item: "Bangus 1kg", qty: 5, reason: "Correction of MV-0005 (miscount)", at: "Sep 02 · 17:20" },
  { id: "MV-0007", sku: "HB-CRA-ALIMANGO-1KG", item: "Alimango 1kg", qty: 24, reason: "Restock — morning catch", at: "Sep 03 · 06:30" },
  { id: "MV-0008", sku: "HB-CRA-ALIMANGO-1KG", item: "Alimango 1kg", qty: -1, reason: "Order #HB-003", at: "Sep 03 · 11:08" },
];

const STATUS_STEPS = ["Pending", "Confirmed", "Out for Delivery", "Delivered"];
const TEAM = [
  { name: "Pam", role: "The Visionary", initial: "P" },
  { name: "Ichan", role: "The Chef Brain", initial: "I" },
  { name: "Chels", role: "The Planner", initial: "C" },
  { name: "Kiel", role: "The Negotiator", initial: "K" },
  { name: "EJ", role: "The Tech Guy", initial: "E" },
];

type CartItem = { id: string; name: string; price: number; unit: string; qty: number };
type View = "client" | "admin" | "payment" | "track" | "about" | "contact";

// ─── Admin Login ──────────────────────────────────────────────────────────────

function AdminLogin({ onUnlock }: { onUnlock: () => void }) {
  const [user, setUser] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  function attempt() {
    if (user === "admin" && pw === "admin123") { onUnlock(); }
    else { setError(true); setPw(""); }
  }

  return (
    <div className="h-full bg-[color:var(--teal-deep)] flex items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8 shadow-[6px_6px_0_var(--shadow-ink)]">
        <div className="text-center mb-7">
          <BrandLogo size="lg" />
          <p className="eyebrow text-[color:var(--muted)] mt-2">{"// Admin Portal"}</p>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Username</Label>
            <div className="mt-1">
              <FieldInput
                placeholder="Enter username"
                value={user}
                onChange={v => { setUser(v); setError(false); }}
              />
            </div>
          </div>
          <div>
            <Label>Password</Label>
            <div className="mt-1">
              <FieldInput
                type="password" placeholder="Enter admin password"
                value={pw}
                onChange={v => { setPw(v); setError(false); }}
              />
            </div>
            {error && <p className="text-xs font-mono text-[color:var(--coral-ink)] mt-1.5">Incorrect username or password. Please try again.</p>}
          </div>
          <Btn label="Log In" filled full onClick={attempt} />
          <p className="text-center text-[11px] font-mono text-[color:var(--muted)]">Demo · user <span className="font-bold text-[color:var(--ink)]">admin</span> · pass <span className="font-bold text-[color:var(--ink)]">admin123</span></p>
        </div>
      </Card>
    </div>
  );
}

// ─── Client View ──────────────────────────────────────────────────────────────

function ClientView({ products, categories, onCheckout, onNavigate }: {
  products: Product[];
  categories: Category[];
  onCheckout: (cart: CartItem[]) => void;
  onNavigate: (v: View) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const categoryNames = ["All", ...categories.map(c => c.name)];
  const query = search.trim().toLowerCase();
  const filtered = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = query === "" ||
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const deliveryFee = cartTotal >= 500 ? 0 : 50;

  function addToCart(p: Product) {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: p.id, name: p.name, price: p.price, unit: p.unit, qty: 1 }];
    });
  }
  function removeFromCart(id: string) { setCart(prev => prev.filter(i => i.id !== id)); }

  const stockColor = (s: string) =>
    s === "In Stock" ? "text-[color:var(--teal)]" : s === "Low Stock" ? "text-[color:var(--marigold)]" : "text-[color:var(--coral-ink)]";

  return (
    <div className="flex flex-col h-full bg-[color:var(--paper)]">
      {/* Nav */}
      <nav className="bg-[color:var(--paper)] border-b-2 border-[color:var(--line)] px-4 md:px-6 py-3 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo />
          <div className="hidden md:flex items-center gap-6 font-mono text-xs uppercase tracking-wider">
            <span className="font-bold text-[color:var(--ink)] border-b-2 border-[color:var(--teal)] pb-0.5">Shop</span>
            {(["about","track","contact"] as View[]).map((v, i) => (
              <span key={v} onClick={() => onNavigate(v)}
                className="text-[color:var(--muted)] hover:text-[color:var(--ink)] cursor-pointer transition-colors">
                {["About","Track Order","Contact"][i]}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)}
              className="hidden md:flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-1.5 text-xs font-mono uppercase tracking-wide text-[color:var(--ink)] hover:bg-[color:var(--paper-2)] transition-colors">
              <IcSearch size={13} /> Search
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden rounded-[var(--radius-sm)] border border-[color:var(--line)] px-2.5 py-1.5 text-[color:var(--ink)]">
              <IcMenu size={16} />
            </button>
            <button onClick={() => setCartOpen(true)}
              className="flex items-center gap-1.5 bg-[color:var(--coral)] text-white rounded-[var(--radius-sm)] border border-transparent shadow-[var(--shadow-coral)] active:translate-y-[1px] px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition-all">
              <IcCart size={14} /> Cart
              {cartCount > 0 && <span className="bg-white text-[color:var(--ink)] font-bold text-[10px] font-mono px-1.5 py-0.5 border border-[color:var(--line)]">{cartCount}</span>}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t-2 border-[color:var(--line)] mt-3 pt-3 flex flex-col gap-1 font-mono text-xs uppercase tracking-wider">
            <span className="font-bold text-[color:var(--ink)] py-1.5 px-1">Shop</span>
            {(["about","track","contact"] as View[]).map((v, i) => (
              <span key={v} onClick={() => { onNavigate(v); setMenuOpen(false); }}
                className="text-[color:var(--muted)] py-1.5 px-1 cursor-pointer hover:text-[color:var(--ink)]">
                {["About","Track Order","Contact"][i]}
              </span>
            ))}
          </div>
        )}
      </nav>

      {searchOpen && (
        <div className="bg-[color:var(--paper-2)] border-b-2 border-[color:var(--line)] px-4 md:px-6 py-3 shrink-0">
          <FieldInput placeholder="Search for bangus, hipon, alimango…" value={search} onChange={setSearch} />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto">
          {/* Hero — editorial: oversized headline, mono eyebrow, one offset-shadow image block */}
          <div className="border-b-2 border-[color:var(--line)] bg-[color:var(--teal)]">
            <div className="px-4 md:px-10 pt-8 pb-9 flex flex-col md:flex-row items-center gap-8 md:gap-10">
              <div className="flex-1 w-full">
                <p className="eyebrow text-white/90 mb-4">Fresh Catch <span className="text-[color:var(--aqua)]">{"//"}</span> Dasmariñas City</p>
                <h1 className="font-display font-black text-white leading-[0.92] tracking-tight text-5xl md:text-7xl mb-5">
                  ORDER<br />FRESH<br /><span className="text-[color:var(--aqua)]">SEAFOOD.</span>
                </h1>
                <p className="text-white/90 text-sm md:text-base mb-7 leading-relaxed max-w-md">
                  Skip the market. The freshest daily catch, boxed and delivered straight to your door.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Btn label="Order Now" filled onClick={() => onNavigate("client")} />
                  <Btn label="View Menu" white />
                </div>
              </div>
              <div className="w-52 md:w-80 shrink-0">
                <div className="bg-[color:var(--paper)] border-2 border-[color:var(--line)] shadow-[6px_6px_0_var(--shadow-ink)] p-5 flex items-center justify-center">
                  <img src={frame151Logo} alt="" aria-hidden="true" className="w-full object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* Category filter */}
          <div className="mx-4 md:mx-6 mt-7">
            <div className="flex items-baseline gap-3 mb-1 flex-wrap">
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[color:var(--ink)] uppercase tracking-tight">Our Products</h2>
              <span className="eyebrow text-[color:var(--muted)]">{"// Sourced fresh every morning"}</span>
            </div>
            <div className="border-t-2 border-[color:var(--line)] mt-2 mb-5" />
            <div className="flex gap-2 mb-6 flex-wrap">
              {categoryNames.map(c => (
                <button key={c} onClick={() => setActiveCategory(c)}
                  className={`px-4 py-1.5 text-xs font-bold font-mono uppercase tracking-wide rounded-full border border-[color:var(--line)] transition-all ${activeCategory === c ? "bg-[color:var(--ink)] text-[color:var(--paper)] border-transparent" : "bg-[color:var(--paper)] text-[color:var(--ink)] hover:bg-[color:var(--aqua)]"}`}>
                  {c}
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border-2 border-dashed border-[color:var(--line)]">
                <div className="text-[color:var(--teal)]"><IcFish size={44} /></div>
                <p className="text-sm font-mono text-[color:var(--muted)]">
                  {query
                    ? `No products match "${search.trim()}".`
                    : "No products available in this category yet."}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
              {filtered.map(p => (
                <Card key={p.id} className="flex flex-col hover:shadow-[4px_4px_0_var(--shadow-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-150 overflow-hidden">
                  <ImgFrame label={p.name} />
                  <div className="p-4 flex flex-col gap-1.5 flex-1">
                    <Tag label={p.category} />
                    <p className="text-sm font-bold text-[color:var(--ink)] mt-1 leading-tight">{p.name}</p>
                    <p className="font-mono text-base font-bold text-[color:var(--ink)]">₱{p.price}<span className="text-[11px] font-normal text-[color:var(--muted)]">{p.unit}</span></p>
                    <p className={`text-[11px] font-mono font-bold uppercase tracking-wide ${stockColor(p.status)}`}>● {p.status}</p>
                    <div className="mt-2">
                      <Btn label={p.status === "Out of Stock" ? "Unavailable" : "+ Add to Cart"}
                        filled={p.status !== "Out of Stock"} disabled={p.status === "Out of Stock"}
                        small full onClick={() => addToCart(p)} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Why Choose — bordered 3-up row on deep teal */}
          <div className="mt-10 border-t-2 border-b-2 border-[color:var(--line)] bg-[color:var(--teal-deep)] px-4 md:px-10 py-9">
            <p className="eyebrow text-[color:var(--aqua)] mb-1">{"// Why Hook&Box"}</p>
            <h2 className="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight mb-6">Fresh. Fast. Fuss-free.</h2>
            <div className="grid md:grid-cols-3 gap-0 border-2 border-[color:var(--line)]">
              {[
                { icon: <IcHome size={24} />, no: "01", title: "No Market Trips", desc: "Order from home and skip the commute and the crowd." },
                { icon: <IcFish size={24} />, no: "02", title: "Fresh Daily Catch", desc: "Sourced fresh every morning — quality guaranteed." },
                { icon: <IcTruck size={24} />, no: "03", title: "Fast Lalamove Delivery", desc: "Delivered straight to your door, same day." },
              ].map((item, i) => (
                <div key={item.title} className={`bg-[color:var(--paper)] p-5 flex flex-col gap-2.5 ${i < 2 ? "border-b-2 md:border-b-0 md:border-r-2 border-[color:var(--line)]" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 bg-[color:var(--aqua)] border-2 border-[color:var(--line)] flex items-center justify-center text-[color:var(--ink)]">{item.icon}</div>
                    <span className="font-mono font-bold text-2xl text-[color:var(--ink)]/20">{item.no}</span>
                  </div>
                  <p className="font-bold text-[color:var(--ink)] text-sm">{item.title}</p>
                  <p className="text-xs text-[color:var(--muted)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart drawer */}
        {cartOpen && (
          <div className="fixed inset-0 z-50 bg-[color:var(--paper)] flex flex-col md:static md:inset-auto md:z-auto md:w-80 md:shrink-0 md:border-l-2 md:border-[color:var(--line)]">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[color:var(--line)] bg-[color:var(--paper)]">
              <span className="flex items-center gap-2 font-display font-extrabold uppercase tracking-tight text-[color:var(--ink)]">
                <IcCart size={16} className="text-[color:var(--coral)]" /> Your Cart
              </span>
              <button onClick={() => setCartOpen(false)} aria-label="Close cart" className="text-[color:var(--ink)] hover:text-[color:var(--coral)] text-lg font-mono">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-[color:var(--paper-2)]">
              {cart.length === 0 ? (
                <div className="text-center mt-12 flex flex-col items-center gap-3">
                  <div className="text-[color:var(--teal)]"><IcFish size={44} /></div>
                  <p className="text-sm font-mono font-bold uppercase tracking-wide text-[color:var(--ink)]">Cart is empty</p>
                  <p className="text-xs text-[color:var(--muted)]">Add some fresh seafood to get started.</p>
                </div>
              ) : cart.map(item => (
                <Card key={item.id} className="flex items-start gap-3 p-3">
                  <div className="w-12 h-12 bg-[color:var(--paper-2)] border-2 border-[color:var(--line)] flex items-center justify-center text-[color:var(--teal)] shrink-0">
                    <IcFish size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[color:var(--ink)] truncate">{item.name}</p>
                    <p className="text-[11px] font-mono text-[color:var(--muted)]">₱{item.price} {item.unit} × {item.qty}</p>
                    <p className="font-mono text-sm font-bold text-[color:var(--ink)]">₱{item.price * item.qty}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`} className="text-[color:var(--muted)] hover:text-[color:var(--coral)] text-sm mt-0.5 font-mono">✕</button>
                </Card>
              ))}
            </div>
            <div className="px-5 py-4 border-t-2 border-[color:var(--line)] bg-[color:var(--paper)] font-mono">
              <div className="flex justify-between text-sm text-[color:var(--ink)] mb-1"><span>Subtotal</span><span>₱{cartTotal}</span></div>
              <div className="flex justify-between text-xs text-[color:var(--muted)] mb-1">
                <span>Delivery (Lalamove)</span>
                <span className="flex items-center gap-1">
                  {deliveryFee === 0
                    ? <span className="text-[color:var(--teal)] font-bold">FREE</span>
                    : `₱${deliveryFee}`}
                </span>
              </div>
              {deliveryFee > 0 && <p className="text-[10px] text-[color:var(--muted)] mb-2">Free delivery on orders ₱500+</p>}
              <div className="flex justify-between font-bold text-[color:var(--ink)] text-base mb-4 pt-2 border-t-2 border-dashed border-[color:var(--line)]">
                <span>Total</span><span className="text-[color:var(--ink)]">₱{cartTotal + deliveryFee}</span>
              </div>
              {cart.length > 0 && (
                <Btn label="Proceed to Checkout →" filled full onClick={() => { setCartOpen(false); onCheckout(cart); }} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin View ───────────────────────────────────────────────────────────────

function AdminView({ products, onLock }: { products: Product[]; onLock: () => void }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "orders" | "ledger">("dashboard");
  const [inventory, setInventory] = useState<Product[]>(products);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState("");
  const [invSearch, setInvSearch] = useState("");
  const [invCategory, setInvCategory] = useState("All");
  const [invStatus, setInvStatus] = useState<"All" | "In Stock" | "Low Stock" | "Out of Stock">("All");
  const [addOpen, setAddOpen] = useState(false);

  function saveStock(id: string) {
    const val = parseInt(editStock);
    if (!isNaN(val)) {
      setInventory(prev => prev.map(p =>
        p.id === id ? { ...p, stock: val, status: val === 0 ? "Out of Stock" : val <= 10 ? "Low Stock" : "In Stock" } : p
      ));
    }
    setEditingId(null);
  }

  const lowItems = inventory.filter(p => p.status !== "In Stock");
  const pending = ORDERS.filter(o => o.status === "Pending").length;

  const invCategories = ["All", ...Array.from(new Set(inventory.map(p => p.category))).sort()];
  const invQuery = invSearch.trim().toLowerCase();
  const filteredInventory = inventory.filter(p => {
    const matchesSearch = invQuery === "" ||
      p.name.toLowerCase().includes(invQuery) ||
      p.category.toLowerCase().includes(invQuery);
    const matchesCategory = invCategory === "All" || p.category === invCategory;
    const matchesStatus = invStatus === "All" || p.status === invStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  const filtersActive = invQuery !== "" || invCategory !== "All" || invStatus !== "All";

  const tabs = [
    { key: "dashboard" as const, icon: <IcChart size={15} />, label: "Dashboard" },
    { key: "inventory" as const, icon: <IcBox size={15} />, label: "Inventory" },
    { key: "orders" as const, icon: <IcDoc size={15} />, label: "Orders" },
    { key: "ledger" as const, icon: <IcClock size={15} />, label: "Ledger" },
  ];

  return (
    <div className="flex flex-col md:flex-row h-full bg-[color:var(--paper)]">
      {/* Mobile tab strip */}
      <div className="md:hidden flex bg-[color:var(--teal-deep)] shrink-0 overflow-x-auto border-b-2 border-[color:var(--line)]">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-5 py-3 text-xs font-mono font-bold uppercase tracking-wide whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === t.key ? "bg-[color:var(--coral)] text-white" : "text-[color:var(--aqua)] hover:text-white"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-[color:var(--teal-deep)] flex-col shrink-0 border-r-2 border-[color:var(--line)]">
        <div className="px-5 py-5 border-b-2 border-[color:var(--line)]">
          <BrandLogo size="md" />
          <p className="eyebrow text-[color:var(--aqua)] mt-2">{"// Admin Portal"}</p>
        </div>
        <nav className="flex flex-col py-3 gap-0.5 flex-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`text-left px-5 py-3 text-sm font-mono font-bold uppercase tracking-wide flex items-center gap-3 transition-colors border-l-4 ${activeTab === t.key ? "bg-[color:var(--coral)] text-white border-l-white" : "text-[color:var(--aqua)] border-l-transparent hover:bg-white/5 hover:text-white"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t-2 border-[color:var(--line)]">
          <p className="text-[10px] font-mono text-[color:var(--aqua)] mb-2 uppercase tracking-wide">Logged in as Admin</p>
          <button onClick={onLock} className="w-full text-xs font-mono font-bold uppercase tracking-wide border-2 border-[color:var(--aqua)]/40 text-[color:var(--aqua)] hover:border-white hover:text-white py-2 transition-colors">
            Log Out
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 md:px-8 py-6">

          {activeTab === "dashboard" && (
            <>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[color:var(--ink)] uppercase tracking-tight mb-5">Dashboard</h2>

              {lowItems.length > 0 && (
                <div className="mb-5 bg-[color:var(--marigold)] border-2 border-[color:var(--line)] shadow-[3px_3px_0_var(--shadow-ink)] px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-sm text-[color:var(--ink)] font-bold flex items-center gap-2">
                    <IcWarning size={16} className="text-[color:var(--ink)] shrink-0" />
                    {lowItems.length} item{lowItems.length > 1 ? "s" : ""} need attention: {lowItems.map(i => i.name).join(", ")}
                  </p>
                  <button onClick={() => setActiveTab("inventory")} className="text-xs font-mono font-bold uppercase tracking-wide text-[color:var(--ink)] underline whitespace-nowrap">
                    Go to Inventory →
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Orders Today", value: "24", sub: "Sep 1, 2026", icon: <IcDoc size={18} className="text-[color:var(--teal)]" />, accent: "border-t-[color:var(--teal)]", valColor: "text-[color:var(--ink)]" },
                  { label: "Revenue Today", value: "₱12,480", sub: "+8% vs yesterday", icon: <IcPeso size={18} className="text-[color:var(--teal)]" />, accent: "border-t-[color:var(--cyan)]", valColor: "text-[color:var(--ink)]" },
                  { label: "Stock Alerts", value: String(lowItems.length), sub: "Low / out of stock", icon: <IcWarning size={18} className="text-[color:var(--marigold)]" />, accent: "border-t-[color:var(--marigold)]", valColor: "text-[color:var(--ink)]" },
                  { label: "Pending Orders", value: String(pending), sub: "Needs confirmation", icon: <IcClock size={18} className="text-[color:var(--plum)]" />, accent: "border-t-[color:var(--plum)]", valColor: "text-[color:var(--ink)]" },
                ].map(card => (
                  <Card key={card.label} className={`p-5 border-t-8 ${card.accent}`}>
                    <div className="flex items-start justify-between">
                      <Label>{card.label}</Label>
                      {card.icon}
                    </div>
                    <p className={`font-mono font-bold text-2xl mt-1 ${card.valColor}`}>{card.value}</p>
                    <Label sub>{card.sub}</Label>
                  </Card>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="p-5">
                  <Label>Sales This Week</Label>
                  <div className="flex items-end gap-2 mt-4 h-32 border-b-2 border-[color:var(--line)] pb-0">
                    {[40, 65, 55, 80, 90, 70, 48].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div className="w-full bg-[color:var(--teal)] border-2 border-[color:var(--line)] border-b-0" style={{ height: `${h}%` }} />
                        <span className="text-[9px] font-mono text-[color:var(--muted)]">{["M","T","W","T","F","S","S"][i]}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-5">
                  <Label>Top Selling Items</Label>
                  <div className="flex flex-col gap-3 mt-4">
                    {[
                      { name: "Bangus", pct: 85 },
                      { name: "Hipon", pct: 72 },
                      { name: "Alimango", pct: 60 },
                      { name: "Pusit", pct: 48 },
                    ].map(item => (
                      <div key={item.name} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[color:var(--ink)] w-20">{item.name}</span>
                        <div className="flex-1 h-3 bg-[color:var(--paper-2)] border-2 border-[color:var(--line)] overflow-hidden">
                          <div className="h-full bg-[color:var(--teal)]" style={{ width: `${item.pct}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-[color:var(--muted)] w-8 text-right">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-5">
                <Label>Recent Orders</Label>
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead>
                      <tr className="border-b-2 border-[color:var(--line)]">
                        {["Order ID","Customer","Total","Payment","Status"].map(h => (
                          <th key={h} className="text-left text-[11px] font-mono text-[color:var(--muted)] font-bold uppercase tracking-wider pb-2 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ORDERS.map(o => (
                        <tr key={o.id} className="border-b border-[color:var(--line)]/25 hover:bg-[color:var(--paper-2)]">
                          <td className="py-3 pr-4 text-xs font-mono font-bold text-[color:var(--teal)]">{o.id}</td>
                          <td className="py-3 pr-4 text-xs text-[color:var(--ink)] font-medium">{o.customer}</td>
                          <td className="py-3 pr-4 text-xs font-mono font-bold text-[color:var(--ink)]">₱{o.total}</td>
                          <td className="py-3 pr-4"><Tag label={o.payment} color="muted" /></td>
                          <td className="py-3"><Tag label={o.status} color={o.status === "Delivered" ? "muted" : "accent"} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {activeTab === "inventory" && (
            <>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[color:var(--ink)] uppercase tracking-tight">Inventory</h2>
                <Btn label="+ Add Product" filled small onClick={() => setAddOpen(true)} />
              </div>
              <div className="flex gap-3 mb-3 flex-wrap items-center">
                <div className="flex-1 min-w-[160px]"><FieldInput placeholder="Search products…" value={invSearch} onChange={setInvSearch} /></div>
                <div className="relative">
                  <select value={invCategory} onChange={e => setInvCategory(e.target.value)}
                    className="appearance-none border-2 border-[color:var(--line)] rounded-[var(--radius)] pl-3.5 pr-9 py-2.5 text-sm font-mono text-[color:var(--ink)] bg-white outline-none focus:shadow-[3px_3px_0_var(--shadow-ink)] transition-shadow cursor-pointer">
                    {invCategories.map(c => (
                      <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--ink)]">
                    <svg width={14} height={14} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 7 5 5 5-5"/></svg>
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mb-4 flex-wrap items-center">
                <div className="inline-flex border-2 border-[color:var(--line)] bg-white">
                  {([
                    { key: "All", label: "All", dot: "" },
                    { key: "In Stock", label: "In stock", dot: "bg-[color:var(--teal)]" },
                    { key: "Low Stock", label: "Low", dot: "bg-[color:var(--marigold)]" },
                    { key: "Out of Stock", label: "Out", dot: "bg-[color:var(--coral)]" },
                  ] as const).map((s, i) => (
                    <button key={s.key} onClick={() => setInvStatus(s.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wide transition-colors ${i > 0 ? "border-l-2 border-[color:var(--line)]" : ""} ${invStatus === s.key ? "bg-[color:var(--ink)] text-[color:var(--paper)]" : "text-[color:var(--ink)] hover:bg-[color:var(--paper-2)]"}`}>
                      {s.dot && <span className={`w-1.5 h-1.5 ${invStatus === s.key ? "bg-white" : s.dot}`} />}
                      {s.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono text-[color:var(--muted)] ml-1">
                  Showing {filteredInventory.length} of {inventory.length}
                </span>
                {filtersActive && (
                  <button onClick={() => { setInvSearch(""); setInvCategory("All"); setInvStatus("All"); }}
                    className="text-xs font-mono font-bold uppercase tracking-wide text-[color:var(--coral-ink)] hover:underline ml-auto">
                    Clear filters
                  </button>
                )}
              </div>
              <Card className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b-2 border-[color:var(--line)] bg-[color:var(--paper-2)]">
                      {["#","Product","Category","Price","Unit","Stock","Status","Actions"].map(h => (
                        <th key={h} className="text-left text-[11px] font-mono text-[color:var(--ink)] font-bold uppercase tracking-wider px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-5 py-10 text-center text-sm font-mono text-[color:var(--muted)]">
                          {filtersActive
                            ? "No products match these filters. Try clearing them."
                            : "No products yet."}
                        </td>
                      </tr>
                    )}
                    {filteredInventory.map((p, idx) => (
                      <tr key={p.id} className="border-b border-[color:var(--line)]/25 hover:bg-[color:var(--paper-2)] transition-colors">
                        <td className="px-5 py-3 text-xs font-mono text-[color:var(--muted)]">{idx + 1}</td>
                        <td className="px-5 py-3 text-sm font-bold text-[color:var(--ink)]">{p.name}</td>
                        <td className="px-5 py-3"><Tag label={p.category} /></td>
                        <td className="px-5 py-3 text-sm font-mono font-bold text-[color:var(--ink)]">₱{p.price}</td>
                        <td className="px-5 py-3 text-xs font-mono text-[color:var(--muted)]">{p.unit}</td>
                        <td className="px-5 py-3">
                          {editingId === p.id ? (
                            <div className="flex gap-1.5 items-center">
                              <input autoFocus value={editStock} onChange={e => setEditStock(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && saveStock(p.id)}
                                className="border-2 border-[color:var(--line)] rounded-[var(--radius)] px-2 py-1 text-xs font-mono w-16 outline-none focus:shadow-[2px_2px_0_var(--shadow-ink)]" />
                              <Btn label="Save" filled small onClick={() => saveStock(p.id)} />
                            </div>
                          ) : (
                            <span className={`text-sm font-mono font-bold ${p.stock === 0 ? "text-[color:var(--coral-ink)]" : p.stock <= 10 ? "text-[color:var(--marigold)]" : "text-[color:var(--ink)]"}`}>{p.stock}</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[11px] font-mono font-bold uppercase tracking-wide ${p.status === "In Stock" ? "text-[color:var(--teal)]" : p.status === "Low Stock" ? "text-[color:var(--marigold)]" : "text-[color:var(--coral-ink)]"}`}>
                            ● {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-3 font-mono">
                            <button onClick={() => { setEditingId(p.id); setEditStock(String(p.stock)); }}
                              className="text-xs text-[color:var(--teal)] hover:underline font-bold uppercase tracking-wide">Edit</button>
                            <button className="text-xs text-[color:var(--coral-ink)] hover:underline font-bold uppercase tracking-wide">Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}

          {activeTab === "orders" && (
            <>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[color:var(--ink)] uppercase tracking-tight">Orders</h2>
                <div className="flex gap-2 flex-wrap">
                  {["All","Pending","Confirmed","Out for Delivery","Delivered"].map(s => (
                    <button key={s} className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wide border-2 border-[color:var(--line)] transition-colors ${s === "All" ? "bg-[color:var(--ink)] text-[color:var(--paper)]" : "bg-[color:var(--paper)] text-[color:var(--ink)] hover:bg-[color:var(--aqua)]"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {ORDERS.map(o => (
                  <Card key={o.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-sm font-bold text-[color:var(--teal)]">{o.id}</span>
                        <Tag label={o.status} color={o.status === "Delivered" ? "muted" : "accent"} />
                        <Tag label={o.payment} color="muted" />
                        <Tag label="Lalamove" color="muted" />
                      </div>
                      <p className="text-sm font-bold text-[color:var(--ink)]">{o.customer}</p>
                      <p className="text-xs text-[color:var(--muted)] mt-0.5">{o.items}</p>
                      <p className="text-[10px] font-mono text-[color:var(--muted)] mt-1">{o.date}</p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <p className="font-mono font-bold text-xl text-[color:var(--ink)]">₱{o.total}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Btn label="View Details" small />
                        {o.status === "Pending" && <Btn label="Confirm Order" filled small />}
                        {o.status === "Confirmed" && <Btn label="Book Lalamove" filled small />}
                        {o.status === "Out for Delivery" && <Btn label="Mark Delivered" filled small />}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {activeTab === "ledger" && <StockLedger />}
        </div>
      </div>

      {addOpen && (
        <AddProductModal
          categories={invCategories.filter(c => c !== "All")}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Stock Ledger (the signature) ─────────────────────────────────────────────
// Append-only receipt tape. Additions in teal, removals in coral, running
// balance on the right. Rows are never edited — a mistake is corrected with a
// new compensating movement (see MV-0005 → MV-0006 below).

function StockLedger() {
  // Running balance across the whole tape (chronological, as printed).
  const rows = MOVEMENTS.reduce<(Movement & { balance: number })[]>((acc, m) => {
    const prev = acc.length ? acc[acc.length - 1].balance : 0;
    acc.push({ ...m, balance: prev + m.qty });
    return acc;
  }, []);
  const balance = rows.length ? rows[rows.length - 1].balance : 0;
  const totalIn = MOVEMENTS.filter(m => m.qty > 0).reduce((s, m) => s + m.qty, 0);
  const totalOut = MOVEMENTS.filter(m => m.qty < 0).reduce((s, m) => s + m.qty, 0);

  return (
    <>
      <div className="flex items-baseline gap-3 mb-1 flex-wrap">
        <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[color:var(--ink)] uppercase tracking-tight">Stock Ledger</h2>
        <span className="eyebrow text-[color:var(--muted)]">{"// Append-only · never edited"}</span>
      </div>
      <p className="text-sm text-[color:var(--muted)] mb-6 max-w-lg">
        Every stock change is one immutable line. Corrections are new lines that cancel
        the mistake — the history stays intact.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-[color:var(--card)] border-2 border-[color:var(--line)] rounded-[var(--radius-lg)] px-4 py-3">
          <p className="eyebrow text-[color:var(--muted)]">Movements</p>
          <p className="font-display font-black text-2xl text-[color:var(--ink)]">{rows.length}</p>
        </div>
        <div className="bg-[color:var(--card)] border-2 border-[color:var(--line)] rounded-[var(--radius-lg)] px-4 py-3">
          <p className="eyebrow text-[color:var(--muted)]">Total In</p>
          <p className="font-display font-black text-2xl text-[color:var(--teal)]">+{totalIn}</p>
        </div>
        <div className="bg-[color:var(--card)] border-2 border-[color:var(--line)] rounded-[var(--radius-lg)] px-4 py-3">
          <p className="eyebrow text-[color:var(--muted)]">Total Out</p>
          <p className="font-display font-black text-2xl text-[color:var(--coral-ink)]">{totalOut}</p>
        </div>
        <div className="bg-[color:var(--card)] border-2 border-[color:var(--line)] rounded-[var(--radius-lg)] px-4 py-3">
          <p className="eyebrow text-[color:var(--muted)]">On Hand</p>
          <p className="font-display font-black text-2xl text-[color:var(--ink)]">{balance}</p>
        </div>
      </div>

      {/* Full-width ledger table */}
      <div className="bg-[color:var(--card)] border-2 border-[color:var(--line)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[color:var(--teal-deep)] text-[color:var(--card)] text-left">
                <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider font-semibold">Ref</th>
                <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider font-semibold">Date / Time</th>
                <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider font-semibold">Item</th>
                <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider font-semibold">Reason</th>
                <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider font-semibold text-right">Qty</th>
                <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider font-semibold text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-t border-[color:var(--line)] ${i % 2 ? "bg-[color:var(--paper)]/40" : ""}`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-[color:var(--muted)] whitespace-nowrap">{r.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[color:var(--muted)] whitespace-nowrap">{r.at}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-[color:var(--ink)]">{r.item}</p>
                    <p className="font-mono text-[10px] text-[color:var(--muted)]/70">{r.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--muted)]">{r.reason}</td>
                  <td className={`px-4 py-3 text-right font-mono font-bold whitespace-nowrap ${r.qty < 0 ? "text-[color:var(--coral-ink)]" : "text-[color:var(--teal)]"}`}>
                    {r.qty > 0 ? `+${r.qty}` : r.qty}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-[color:var(--ink)] whitespace-nowrap">{r.balance}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[color:var(--line-strong)] bg-[color:var(--paper-2)]/50">
                <td colSpan={4} className="px-4 py-3 font-display font-bold uppercase tracking-tight text-[color:var(--ink)] text-right">On Hand</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-[color:var(--muted)] whitespace-nowrap">
                  <span className="text-[color:var(--teal)]">+{totalIn}</span> / <span className="text-[color:var(--coral-ink)]">{totalOut}</span>
                </td>
                <td className="px-4 py-3 text-right font-display font-black text-lg text-[color:var(--ink)] whitespace-nowrap">{balance}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Add Product Modal ────────────────────────────────────────────────────────

function AddProductModal({ categories, onClose }: { categories: string[]; onClose: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "Fish");
  const [description, setDescription] = useState("");

  type VariantDraft = { name: string; sku: string; price: string; stock: string };
  const emptyVariant = (): VariantDraft => ({ name: "", sku: "", price: "", stock: "" });
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);

  function updateVariant(idx: number, patch: Partial<VariantDraft>) {
    setVariants(vs => vs.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  }
  function addVariant() {
    setVariants(vs => [...vs, emptyVariant()]);
  }
  function removeVariant(idx: number) {
    setVariants(vs => (vs.length > 1 ? vs.filter((_, i) => i !== idx) : vs));
  }

  // Auto-suggest a SKU from category + product name, e.g. HB-FIS-BANGUS-500G
  function suggestSku(variantName: string) {
    return (
      "HB-" +
      (category.slice(0, 3).toUpperCase() || "GEN") +
      "-" +
      (name.trim().split(/\s+/)[0]?.toUpperCase().replace(/[^A-Z0-9]/g, "") || "SKU") +
      (variantName.trim() ? "-" + variantName.trim().split(/\s+/)[0].toUpperCase().replace(/[^A-Z0-9]/g, "") : "")
    );
  }

  const catOptions = categories.length ? categories : ["Fish", "Shellfish", "Squid & Octopus", "Crustaceans"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color:var(--ink)]/60" onClick={onClose}>
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-[color:var(--paper)] border-2 border-[color:var(--line)] shadow-[6px_6px_0_var(--shadow-ink)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[color:var(--teal)] border-b-2 border-[color:var(--line)] px-6 py-4 flex items-start justify-between shrink-0">
          <div>
            <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-tight">Add New Product</h3>
            <p className="text-xs font-mono text-white/85 mt-0.5">Fill in product details and at least one variant</p>
          </div>
          <button onClick={onClose} className="text-white/85 hover:text-white transition-colors mt-0.5" aria-label="Close">
            <IcXCircle size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* Section 1 — Product info */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 bg-[color:var(--coral)] text-white border-2 border-[color:var(--line)] text-[11px] font-mono font-bold flex items-center justify-center">1</span>
              <Label>Product Info</Label>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-mono font-bold uppercase tracking-wide text-[color:var(--ink)]">Product Name <span className="text-[color:var(--coral-ink)]">*</span></label>
                <FieldInput placeholder="e.g. Galunggong (Round Scad)" value={name} onChange={setName} />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-mono font-bold uppercase tracking-wide text-[color:var(--ink)]">Category <span className="text-[color:var(--coral-ink)]">*</span></label>
                <div className="relative">
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full appearance-none border-2 border-[color:var(--line)] rounded-[var(--radius)] pl-4 pr-9 py-2.5 text-sm font-mono text-[color:var(--ink)] bg-white outline-none focus:shadow-[3px_3px_0_var(--shadow-ink)] transition-shadow cursor-pointer">
                    {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--ink)]">
                    <svg width={14} height={14} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 7 5 5 5-5"/></svg>
                  </span>
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-mono font-bold uppercase tracking-wide text-[color:var(--ink)]">Description <span className="text-[color:var(--muted)] font-normal normal-case">(optional)</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                  placeholder="Short description visible to customers…"
                  className="w-full border-2 border-[color:var(--line)] rounded-[var(--radius)] px-4 py-2.5 text-sm text-[color:var(--ink)] placeholder-[color:var(--muted)] bg-white outline-none focus:shadow-[3px_3px_0_var(--shadow-ink)] transition-shadow resize-none" />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-mono font-bold uppercase tracking-wide text-[color:var(--ink)]">Product Photo <span className="text-[color:var(--muted)] font-normal normal-case">(placeholder only)</span></label>
                <div className="w-full border-2 border-dashed border-[color:var(--line)] py-6 flex flex-col items-center justify-center gap-1.5 text-[color:var(--muted)] bg-[color:var(--paper-2)]">
                  <IcUpload size={22} className="text-[color:var(--teal)]" />
                  <span className="text-sm font-mono font-bold text-[color:var(--ink)]">Upload a photo</span>
                  <span className="text-[11px] font-mono text-[color:var(--muted)]">JPG, PNG, WEBP · max ~5 MB</span>
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* Section 2 — Variants */}
          <section>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="w-6 h-6 bg-[color:var(--coral)] text-white border-2 border-[color:var(--line)] text-[11px] font-mono font-bold flex items-center justify-center">2</span>
              <Label>Variants</Label>
              <span className="text-xs font-mono text-[color:var(--muted)]">Price &amp; stock live here, not on the product</span>
            </div>

            <div className="flex flex-col gap-4">
              {variants.map((v, idx) => {
                const suggestedSku = suggestSku(v.name);
                return (
                  <div key={idx} className="border-2 border-[color:var(--line)] p-4 bg-[color:var(--paper-2)]">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-mono font-bold text-[color:var(--ink)] uppercase tracking-wider">Variant {idx + 1}</p>
                      {variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(idx)}
                          className="text-[11px] font-mono font-bold uppercase tracking-wide text-[color:var(--coral-ink)] hover:underline transition-colors">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1.5 text-xs font-mono font-bold uppercase tracking-wide text-[color:var(--ink)]">Variant Name <span className="text-[color:var(--coral-ink)]">*</span></label>
                        <FieldInput placeholder="e.g. 500g, Whole, Per Kilo" value={v.name} onChange={val => updateVariant(idx, { name: val })} />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-xs font-mono font-bold uppercase tracking-wide text-[color:var(--ink)]">SKU <span className="text-[color:var(--coral-ink)]">*</span></label>
                        <FieldInput placeholder={suggestedSku} value={v.sku} onChange={val => updateVariant(idx, { sku: val })} />
                        <button type="button" onClick={() => updateVariant(idx, { sku: suggestedSku })}
                          className="text-[11px] font-mono font-bold uppercase tracking-wide text-[color:var(--teal)] hover:underline mt-1">Auto-suggest SKU</button>
                      </div>
                      <div>
                        <label className="block mb-1.5 text-xs font-mono font-bold uppercase tracking-wide text-[color:var(--ink)]">Price (₱) <span className="text-[color:var(--coral-ink)]">*</span></label>
                        <FieldInput type="number" placeholder="₱ 0.00" value={v.price} onChange={val => updateVariant(idx, { price: val })} />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-xs font-mono font-bold uppercase tracking-wide text-[color:var(--ink)]">Initial Stock</label>
                        <FieldInput type="number" placeholder="0 (adjust later)" value={v.stock} onChange={val => updateVariant(idx, { stock: val })} />
                      </div>
                    </div>
                  </div>
                );
              })}

              <button type="button" onClick={addVariant}
                className="w-full border-2 border-dashed border-[color:var(--line)] py-3 text-sm font-mono font-bold uppercase tracking-wide text-[color:var(--ink)] hover:bg-[color:var(--aqua)] transition-colors">
                + Add Another Variant
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-[color:var(--line)] px-6 py-4 flex justify-end gap-3 shrink-0 bg-[color:var(--paper)]">
          <Btn label="Cancel" onClick={onClose} />
          <Btn label="Save Product" filled onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

// ─── Payment View ─────────────────────────────────────────────────────────────

// Quiet reassurance strip that fills the lower checkout column on short steps.
// Restrained by design: hairline framing, one muted icon per item, one honest
// line of copy. Content stays truthful to frozen scope (no real settlement,
// Lalamove is a label, no real SMS). Reuses existing Ic* icons only.
type Assurance = { icon: React.ReactNode; label: string; copy: string };
function CheckoutNotes({ items }: { items: Assurance[] }) {
  return (
    <div className="border-t border-[color:var(--line)] pt-5 mt-1 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
      {items.map(it => (
        <div key={it.label} className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-[var(--radius-sm)] bg-[color:var(--paper-2)] border border-[color:var(--line)] flex items-center justify-center text-[color:var(--teal)] shrink-0">
            {it.icon}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[color:var(--ink)] leading-tight">{it.label}</p>
            <p className="text-[11px] text-[color:var(--muted)] leading-snug mt-0.5">{it.copy}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentView({ cart, onBack, onTrack }: { cart: CartItem[]; onBack: () => void; onTrack: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [method, setMethod] = useState<"GCash" | "COD" | "">("");
  const [payError, setPayError] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + deliveryFee;

  const STEP_LABELS = ["Order Review", "Delivery Info", "Payment", "Confirmation"];
  const STEP_ICONS = [
    <IcDoc key="review" size={16} />,
    <IcTruck key="delivery" size={16} />,
    <IcCard key="payment" size={16} />,
    <IcCheckCircle key="confirmation" size={16} />,
  ];

  // Step-specific reassurance copy. Honest to frozen scope: Lalamove is a label,
  // no money is captured, orders end PENDING, no real SMS is sent.
  const STEP_NOTES: Record<1 | 2 | 3 | 4, Assurance[]> = {
    1: [
      { icon: <IcFish size={16} />, label: "Caught daily", copy: "Sourced from the morning catch, packed on ice." },
      { icon: <IcClock size={16} />, label: "Priced by variant", copy: "Each size and cut is weighed and priced on its own." },
      { icon: <IcCheckCircle size={16} />, label: "No surprises", copy: "The total here is the total you pay on delivery." },
    ],
    2: [
      { icon: <IcTruck size={16} />, label: "Dasmariñas & nearby", copy: "We deliver across the city and adjacent barangays." },
      { icon: <IcClock size={16} />, label: "Morning windows", copy: "Pick a slot; freshest stock goes out early." },
      { icon: <IcFish size={16} />, label: "Packed cold", copy: "Every order leaves chilled to hold quality in transit." },
    ],
    3: [
      { icon: <IcCard size={16} />, label: "Manual confirmation", copy: "We verify your GCash or COD choice before preparing the order." },
      { icon: <IcCheckCircle size={16} />, label: "No card stored", copy: "Nothing is charged online; the total is settled on delivery." },
      { icon: <IcPhone size={16} />, label: "Questions welcome", copy: "Reach the shop directly if you need to adjust an order." },
    ],
    4: [
      { icon: <IcDoc size={16} />, label: "Order recorded", copy: "Your order is saved as pending and queued for prep." },
      { icon: <IcFish size={16} />, label: "Being prepared", copy: "Staff pack your items once the order is confirmed." },
      { icon: <IcTruck size={16} />, label: "Track anytime", copy: "Use your order ID to follow its status." },
    ],
  };

  return (
    <div className="h-full bg-[color:var(--paper)] overflow-y-auto">
      {/* Header */}
      <div className="bg-[color:var(--paper)] border-b-2 border-[color:var(--line)] px-4 md:px-6 py-3.5 flex items-center gap-4">
        <button onClick={onBack} className="text-[color:var(--ink)] hover:text-[color:var(--coral)] text-xs font-mono font-bold uppercase tracking-wide transition-colors flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> Back
        </button>
        <BrandLogo size="sm" />
        <span className="eyebrow text-[color:var(--muted)]">{"// Checkout"}</span>
      </div>

      {/* Step indicators */}
      <div className="bg-[color:var(--paper-2)] border-b-2 border-[color:var(--line)] py-5 overflow-x-auto">
        <div className="flex items-center justify-center px-6 gap-0">
          {STEP_LABELS.map((label, idx) => {
            const n = idx + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={n} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 flex items-center justify-center border-2 border-[color:var(--line)] transition-all duration-200 ${done ? "bg-[color:var(--teal)] text-white" : active ? "bg-[color:var(--coral)] text-white shadow-[3px_3px_0_var(--shadow-ink)]" : "bg-[color:var(--paper)] text-[color:var(--muted)]"}`}>
                    {done ? <IcCheckCircle size={17}/> : STEP_ICONS[idx]}
                  </div>
                  <span className={`text-[10px] hidden sm:block whitespace-nowrap font-mono font-bold uppercase tracking-wide transition-colors ${active ? "text-[color:var(--ink)]" : done ? "text-[color:var(--teal)]" : "text-[color:var(--muted)]"}`}>{label}</span>
                </div>
                {idx < 3 && (
                  <div className={`w-10 md:w-20 h-0.5 mx-1 md:mx-2 mb-5 transition-all duration-300 ${done ? "bg-[color:var(--teal)]" : "bg-[color:var(--ink)]/25"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 py-8 flex flex-col md:flex-row gap-6 md:items-start">
        <div className="w-full md:basis-[70%] md:min-w-0 flex flex-col gap-4">

          {step === 1 && (
            <Card className="overflow-hidden">
              <div className="bg-[color:var(--teal)] border-b-2 border-[color:var(--line)] px-6 py-4 flex items-center justify-between">
                <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-tight">Order Summary</h3>
                <Tag label={`${cart.length} item${cart.length !== 1 ? "s" : ""}`} color="white" />
              </div>
              <div className="p-6 flex flex-col gap-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-[color:var(--paper-2)] border-2 border-[color:var(--line)]">
                    <div className="w-14 h-14 bg-[color:var(--paper)] border-2 border-[color:var(--line)] flex items-center justify-center text-[color:var(--teal)] shrink-0">
                      <IcFish size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[color:var(--ink)] truncate">{item.name}</p>
                      <p className="text-xs font-mono text-[color:var(--muted)] mt-0.5">₱{item.price} {item.unit} × {item.qty}</p>
                    </div>
                    <span className="font-mono font-bold text-base text-[color:var(--ink)] shrink-0">₱{item.price * item.qty}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-end"><Btn label="Continue →" filled onClick={() => setStep(2)} /></div>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="overflow-hidden">
              <div className="bg-[color:var(--teal)] border-b-2 border-[color:var(--line)] px-6 py-4">
                <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-tight">Delivery Information</h3>
                <p className="text-xs font-mono text-white/85 mt-0.5">Where should we deliver your order?</p>
              </div>
              <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-[color:var(--aqua)] border-2 border-[color:var(--line)] px-4 py-3">
                <div className="w-8 h-8 bg-[color:var(--ink)] flex items-center justify-center text-[color:var(--aqua)] shrink-0"><IcTruck size={16}/></div>
                <div>
                  <p className="text-xs font-bold text-[color:var(--ink)]">Delivered via Lalamove</p>
                  <p className="text-[10px] font-mono text-[color:var(--ink)]/70">We book your rider once your order is confirmed.</p>
                </div>
              </div>
                <div className="flex gap-3 flex-col sm:flex-row">
                  <div className="flex-1"><Label>First Name</Label><div className="mt-1"><FieldInput placeholder="Maria" /></div></div>
                  <div className="flex-1"><Label>Last Name</Label><div className="mt-1"><FieldInput placeholder="Santos" /></div></div>
                </div>
                <div><Label>Phone Number</Label><div className="mt-1"><FieldInput placeholder="09XX XXX XXXX" /></div></div>
                <div><Label>Street Address</Label><div className="mt-1"><FieldInput placeholder="Block 5, Lot 12, Poblacion…" /></div></div>
                <div className="flex gap-3 flex-col sm:flex-row">
                  <div className="flex-1"><Label>Barangay</Label><div className="mt-1"><FieldInput placeholder="Salawag" /></div></div>
                  <div className="flex-1"><Label>City</Label><div className="mt-1"><FieldInput placeholder="Dasmariñas" /></div></div>
                </div>
                <div>
                  <Label>Courier</Label>
                  <div className="mt-1 flex items-center gap-2 bg-[color:var(--paper-2)] border-2 border-[color:var(--line)] px-4 py-2.5">
                    <Tag label="Lalamove" />
                    <span className="text-xs font-mono text-[color:var(--muted)]">Booked once your order is confirmed.</span>
                  </div>
                </div>
                <div>
                  <Label>Preferred Delivery Time</Label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {["6–8 AM","8–10 AM","10–12 PM"].map((t, i) => (
                      <button key={t} className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wide border-2 border-[color:var(--line)] transition-colors ${i === 0 ? "bg-[color:var(--ink)] text-[color:var(--paper)]" : "bg-[color:var(--paper)] text-[color:var(--ink)] hover:bg-[color:var(--aqua)]"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Delivery Notes (Optional)</Label>
                  <textarea className="mt-1 w-full border-2 border-[color:var(--line)] rounded-[var(--radius)] px-4 py-2.5 text-sm text-[color:var(--ink)] placeholder-[color:var(--muted)] outline-none focus:shadow-[3px_3px_0_var(--shadow-ink)] transition-shadow resize-none h-16" placeholder="e.g. Please clean the fish" />
                </div>
              </div>
              <div className="flex gap-2 px-6 pb-6 justify-end flex-wrap">
                <Btn label="← Back" onClick={() => setStep(1)} />
                <Btn label="Continue →" filled onClick={() => setStep(3)} />
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="overflow-hidden">
              <div className="bg-[color:var(--teal)] border-b-2 border-[color:var(--line)] px-6 py-4">
                <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-tight">Payment Method</h3>
                <p className="text-xs font-mono text-white/85 mt-0.5">Choose how you want to pay</p>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <button onClick={() => { setMethod("GCash"); setPayError(false); }}
                    className={`flex items-center gap-4 p-4 border-2 border-[color:var(--line)] text-left transition-all duration-150 ${method === "GCash" ? "bg-[color:var(--aqua)] shadow-[4px_4px_0_var(--shadow-ink)]" : "bg-[color:var(--paper)] hover:bg-[color:var(--paper-2)]"}`}>
                    <div className={`w-14 h-14 border-2 border-[color:var(--line)] flex items-center justify-center shrink-0 transition-colors ${method === "GCash" ? "bg-[color:var(--ink)] text-white" : "bg-[color:var(--paper-2)] text-[color:var(--ink)]"}`}>
                      <IcGcash size={26} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[color:var(--ink)]">GCash</p>
                      <p className="text-xs font-mono text-[color:var(--muted)] mt-0.5">Scan QR or send to our registered number</p>
                    </div>
                    <div className={`w-6 h-6 border-2 border-[color:var(--line)] flex items-center justify-center shrink-0 transition-all ${method === "GCash" ? "bg-[color:var(--coral)]" : "bg-[color:var(--paper)]"}`}>
                      {method === "GCash" && <IcCheckCircle size={14} className="text-white" />}
                    </div>
                  </button>

                  <button onClick={() => { setMethod("COD"); setPayError(false); }}
                    className={`flex items-center gap-4 p-4 border-2 border-[color:var(--line)] text-left transition-all duration-150 ${method === "COD" ? "bg-[color:var(--aqua)] shadow-[4px_4px_0_var(--shadow-ink)]" : "bg-[color:var(--paper)] hover:bg-[color:var(--paper-2)]"}`}>
                    <div className={`w-14 h-14 border-2 border-[color:var(--line)] flex items-center justify-center shrink-0 transition-colors ${method === "COD" ? "bg-[color:var(--ink)] text-white" : "bg-[color:var(--paper-2)] text-[color:var(--ink)]"}`}>
                      <IcCash size={26} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[color:var(--ink)]">Cash on Delivery</p>
                      <p className="text-xs font-mono text-[color:var(--muted)] mt-0.5">Pay the Lalamove rider upon delivery</p>
                    </div>
                    <div className={`w-6 h-6 border-2 border-[color:var(--line)] flex items-center justify-center shrink-0 transition-all ${method === "COD" ? "bg-[color:var(--coral)]" : "bg-[color:var(--paper)]"}`}>
                      {method === "COD" && <IcCheckCircle size={14} className="text-white" />}
                    </div>
                  </button>
                </div>

                {method === "GCash" && (
                  <div className="overflow-hidden border-2 border-[color:var(--line)]">
                    <div className="bg-[color:var(--ink)] px-4 py-2.5 flex items-center gap-2">
                      <IcGcash size={14} className="text-[color:var(--aqua)]" />
                      <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">GCash Payment Details</span>
                    </div>
                    <div className="p-4 bg-[color:var(--paper-2)] flex flex-col md:flex-row gap-5 items-start">
                      <div className="w-32 h-32 bg-[color:var(--paper)] border-2 border-dashed border-[color:var(--line)] flex flex-col items-center justify-center gap-1 shrink-0">
                        <IcGcash size={28} className="text-[color:var(--muted)]" />
                        <span className="text-[10px] font-mono text-[color:var(--muted)] text-center">QR Placeholder</span>
                      </div>
                      <div className="flex flex-col gap-2.5 text-sm flex-1 font-mono">
                        {[
                          ["GCash Number", "0917-XXX-XXXX"],
                          ["Account Name", "Hook & Box"],
                          ["Amount to Send", `₱${total}`],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between items-center py-1.5 border-b border-dashed border-[color:var(--line)]/30 last:border-0">
                            <span className="text-[color:var(--muted)] text-xs">{k}</span>
                            <span className={`font-bold ${k === "Amount to Send" ? "text-[color:var(--coral-ink)] text-base" : "text-[color:var(--ink)]"}`}>{v}</span>
                          </div>
                        ))}
                        <div className="mt-1 border-2 border-dashed border-[color:var(--line)] p-3 bg-[color:var(--paper)] text-center cursor-pointer hover:bg-[color:var(--aqua)] transition-colors">
                          <p className="text-xs text-[color:var(--ink)] flex items-center justify-center gap-1.5">
                            <IcUpload size={13} /> Upload proof of payment
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {method === "COD" && (
                  <div className="overflow-hidden border-2 border-[color:var(--line)]">
                    <div className="bg-[color:var(--ink)] px-4 py-2.5 flex items-center gap-2">
                      <IcCash size={14} className="text-[color:var(--aqua)]" />
                      <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">Cash on Delivery</span>
                    </div>
                    <div className="p-5 bg-[color:var(--paper-2)] flex items-start gap-4">
                      <div className="w-12 h-12 bg-[color:var(--paper)] border-2 border-[color:var(--line)] flex items-center justify-center text-[color:var(--ink)] shrink-0">
                        <IcCash size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-[color:var(--ink)] leading-relaxed">
                          Prepare <strong className="text-[color:var(--ink)] font-mono text-base">₱{total}</strong> in cash. Our Lalamove rider will collect payment upon delivery.
                        </p>
                        <p className="text-xs font-mono text-[color:var(--muted)] mt-2 flex items-center gap-1.5">
                          <IcPhone size={11} /> SMS confirmation sent once your order is dispatched.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end flex-wrap">
                  <Btn label="← Back" onClick={() => setStep(2)} />
                  <Btn label="Place Order →" filled onClick={() => { if (method) { setPayError(false); setStep(4); } else setPayError(true); }} />
                </div>
                {payError && <p className="text-xs font-mono text-[color:var(--coral-ink)] text-right font-bold -mt-2">Please select a payment method to continue.</p>}
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-8 text-center overflow-hidden relative shadow-[5px_5px_0_var(--shadow-ink)]">
              <div className="absolute top-0 left-0 right-0 h-2 bg-[color:var(--coral)] border-b-2 border-[color:var(--line)]" />
              <div className="w-20 h-20 bg-[color:var(--aqua)] border-2 border-[color:var(--line)] flex items-center justify-center mx-auto text-[color:var(--ink)] mb-4 mt-3">
                <IcCheckCircle size={42} />
              </div>
              <h3 className="font-display font-black text-2xl text-[color:var(--ink)] uppercase tracking-tight">Order Placed!</h3>
              <p className="text-sm text-[color:var(--muted)] mt-1">Your order <strong className="text-[color:var(--coral-ink)] font-mono">#HB-005</strong> has been received.</p>
              <Divider />
              <div className="text-left">
                <Label>Order Details</Label>
                <div className="flex flex-col gap-2 mt-3 text-sm font-mono">
                  {[
                    ["Order ID", <span key="v" className="font-bold text-[color:var(--teal)]">#HB-005</span>],
                    ["Payment", method || "COD"],
                    ["Courier", <Tag key="v" label="Lalamove" />],
                    ["Status", <Tag key="v" label="Pending Confirmation" />],
                    ["Est. Delivery", "Tomorrow, 6–8 AM"],
                    ["Total Paid", <span key="v" className="font-bold text-[color:var(--ink)]">₱{total}</span>],
                  ].map(([k, v], i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-dashed border-[color:var(--line)]/25 last:border-0">
                      <span className="text-[color:var(--muted)]">{k}</span>
                      <span className="text-[color:var(--ink)] font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-[color:var(--paper-2)] border-2 border-[color:var(--line)] p-3 flex items-start gap-2 text-xs text-[color:var(--muted)] leading-relaxed">
                  <IcTruck size={14} className="text-[color:var(--teal)] shrink-0 mt-0.5" />
                  Our team will book your Lalamove pickup once your order is confirmed. You will receive an SMS with delivery updates.
                </div>
              </div>
              <Divider />
              <div className="flex gap-3 justify-center flex-wrap">
                <Btn label="Track My Order" onClick={onTrack} />
                <Btn label="Back to Shop" filled onClick={onBack} />
              </div>
            </Card>
          )}

          <CheckoutNotes items={STEP_NOTES[step]} />
        </div>

        {/* Price sidebar — ~30% of the 70/30 split */}
        <div className="w-full md:basis-[30%] md:min-w-0 shrink-0">
          <Card className="p-5 md:sticky md:top-4 font-mono">
            <Label>Price Breakdown</Label>
            <Divider />
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-xs text-[color:var(--ink)] mb-1.5">
                <span className="truncate pr-2">{item.name} ×{item.qty}</span>
                <span className="shrink-0 font-bold">₱{item.price * item.qty}</span>
              </div>
            ))}
            <Divider />
            <div className="flex justify-between text-xs text-[color:var(--muted)] mb-1.5"><span>Subtotal</span><span>₱{subtotal}</span></div>
            <div className="flex justify-between text-xs text-[color:var(--muted)] mb-1.5">
              <span>Delivery (Lalamove)</span>
              <span>{deliveryFee === 0 ? <span className="text-[color:var(--teal)] font-bold">Free</span> : `₱${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-[color:var(--ink)] text-base mt-3 pt-3 border-t-2 border-dashed border-[color:var(--line)]">
              <span>Total</span><span className="text-[color:var(--ink)]">₱{total}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Understated brand finish so the page bottom reads as designed, not blank. */}
      <div aria-hidden className="max-w-5xl mx-auto px-4 md:px-6 pb-8 -mt-2">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-6 opacity-40">
          <path d="M0 26 C 150 8, 300 8, 450 24 S 750 40, 900 22 S 1150 10, 1200 24" fill="none" stroke="var(--teal)" strokeWidth="2" />
          <path d="M0 32 C 150 16, 300 16, 450 30 S 750 44, 900 28 S 1150 18, 1200 30" fill="none" stroke="var(--cyan)" strokeWidth="1.5" opacity="0.7" />
        </svg>
      </div>
    </div>
  );
}

// ─── Track Order View ─────────────────────────────────────────────────────────

function TrackOrderView({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<typeof ORDERS[0] | null | "not-found">(null);

  function handleTrack() {
    const found = ORDERS.find(o => o.id.toLowerCase() === query.trim().toLowerCase());
    setResult(found ?? "not-found");
  }

  const stepIndex = result && result !== "not-found" ? STATUS_STEPS.indexOf(result.status) : -1;

  const STATUS_ICONS = [
    <IcClock key="pending" size={17} />,
    <IcCheckCircle key="confirmed" size={17} />,
    <IcTruck key="ready" size={17} />,
    <IcBox key="completed" size={17} />,
  ];

  return (
    <div className="h-full bg-[color:var(--paper)] overflow-y-auto">
      <div className="bg-[color:var(--paper)] border-b-2 border-[color:var(--line)] px-4 md:px-6 py-3.5 flex items-center gap-4">
        <button onClick={onBack} className="text-[color:var(--ink)] hover:text-[color:var(--coral)] text-xs font-mono font-bold uppercase tracking-wide transition-colors flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> Back to Shop
        </button>
        <BrandLogo size="sm" />
      </div>

      {/* Teal hero with search */}
      <div className="bg-[color:var(--teal)] border-b-2 border-[color:var(--line)]">
        <div className="px-4 md:px-8 pt-8 pb-9">
          <div className="max-w-xl mx-auto">
            <p className="eyebrow text-[color:var(--aqua)] mb-2">{"// Order Tracker"}</p>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white uppercase tracking-tight mb-2">Track Your Order</h2>
            <p className="text-white/85 text-sm mb-5">Enter your Order ID to see live status updates.</p>
            <div className="flex gap-2">
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleTrack()}
                placeholder="#HB-001"
                className="flex-1 bg-[color:var(--paper)] border-2 border-[color:var(--line)] px-4 py-3 text-sm font-mono text-[color:var(--ink)] placeholder-[color:var(--muted)] outline-none transition-all" />
              <button onClick={handleTrack}
                className="bg-[color:var(--coral)] text-white border-2 border-[color:var(--line)] shadow-[3px_3px_0_var(--shadow-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold text-sm uppercase tracking-wide px-5 py-3 transition-all shrink-0">
                Track →
              </button>
            </div>
            <p className="text-white/60 text-[11px] font-mono mt-2">Try: #HB-001, #HB-002, #HB-003, or #HB-004</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4 pb-10 flex flex-col gap-4">
        {result === "not-found" && (
          <Card className="p-5 text-center overflow-hidden border-[color:var(--coral)]">
            <div className="w-12 h-12 bg-[color:var(--coral)] border-2 border-[color:var(--line)] flex items-center justify-center mx-auto mb-3 text-white">
              <IcXCircle size={22} />
            </div>
            <p className="text-sm font-bold text-[color:var(--coral-ink)] font-mono uppercase tracking-wide">Order not found</p>
            <p className="text-xs text-[color:var(--muted)] mt-1">Double-check your Order ID and try again.</p>
          </Card>
        )}

        {result && result !== "not-found" && (
          <>
            {/* Status card */}
            <Card className="overflow-hidden">
              <div className="bg-[color:var(--teal)] border-b-2 border-[color:var(--line)] px-5 py-3 flex items-center justify-between">
                <span className="eyebrow text-white">Order Status</span>
                <Tag label={result.status} color="white" />
              </div>
              <div className="px-5 pt-6 pb-5">
                <div className="flex items-start gap-0">
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s} className="flex items-center flex-1 min-w-0">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className={`w-11 h-11 flex items-center justify-center border-2 border-[color:var(--line)] shrink-0 transition-all duration-200 ${
                          i < stepIndex ? "bg-[color:var(--teal)] text-white"
                          : i === stepIndex ? "bg-[color:var(--coral)] text-white shadow-[3px_3px_0_var(--shadow-ink)]"
                          : "bg-[color:var(--paper)] text-[color:var(--muted)]"
                        }`}>
                          {i < stepIndex ? <IcCheckCircle size={18}/> : STATUS_ICONS[i]}
                        </div>
                        <span className={`text-[10px] text-center whitespace-nowrap font-mono font-bold uppercase tracking-wide px-0.5 ${i <= stepIndex ? "text-[color:var(--ink)]" : "text-[color:var(--muted)]"}`}>{s}</span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`h-0.5 w-4 md:w-5 mb-6 shrink-0 transition-all duration-300 ${i < stepIndex ? "bg-[color:var(--teal)]" : "bg-[color:var(--ink)]/25"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Order details card */}
            <Card className="overflow-hidden">
              <div className="bg-[color:var(--teal)] border-b-2 border-[color:var(--line)] px-5 py-3">
                <span className="eyebrow text-white">Order Details</span>
              </div>
              <div className="p-5 flex flex-col gap-0 font-mono">
                {([
                  { icon: <IcDoc size={13}/>, label: "Order ID", value: <span className="font-bold text-[color:var(--teal)]">{result.id}</span> },
                  { icon: <IcUsers size={13}/>, label: "Customer", value: result.customer },
                  { icon: <IcFish size={13}/>, label: "Items", value: <span className="text-right text-xs leading-snug max-w-[160px]">{result.items}</span> },
                  { icon: <IcClock size={13}/>, label: "Date Placed", value: result.date },
                  { icon: <IcCard size={13}/>, label: "Payment", value: result.payment },
                  { icon: <IcTruck size={13}/>, label: "Courier", value: <Tag label="Lalamove" /> },
                  { icon: <IcCheckCircle size={13}/>, label: "Status", value: <Tag label={result.status} color={result.status === "Delivered" ? "muted" : "accent"} /> },
                  { icon: <IcPeso size={13}/>, label: "Total", value: <span className="font-bold text-[color:var(--ink)]">₱{result.total}</span> },
                ] as const).map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-dashed border-[color:var(--line)]/25 last:border-0 text-sm">
                    <span className="flex items-center gap-2 text-[color:var(--muted)]">
                      <span className="text-[color:var(--teal)]">{row.icon}</span>{row.label}
                    </span>
                    <span className="text-[color:var(--ink)] font-medium text-right">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5">
                <button disabled
                  className="w-full border-2 border-dashed border-[color:var(--line)] bg-[color:var(--paper-2)] text-[color:var(--muted)] text-xs font-mono font-bold uppercase tracking-wide py-3 cursor-not-allowed flex items-center justify-center gap-2">
                  <IcTruck size={15}/> View on Lalamove — Full Version
                </button>
                <p className="text-[10px] font-mono text-[color:var(--muted)] text-center mt-1.5">
                  {stepIndex >= 2 ? "Live tracking will be linked here once dispatched." : "Available once your order is out for delivery."}
                </p>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// ─── About View ───────────────────────────────────────────────────────────────

function AboutView({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full bg-[color:var(--paper)] overflow-y-auto">
      <div className="bg-[color:var(--paper)] border-b-2 border-[color:var(--line)] px-4 md:px-6 py-3.5 flex items-center gap-4">
        <button onClick={onBack} className="text-[color:var(--ink)] hover:text-[color:var(--coral)] text-xs font-mono font-bold uppercase tracking-wide transition-colors">← Back to Shop</button>
        <BrandLogo size="sm" />
        <span className="eyebrow text-[color:var(--muted)]">{"// About Us"}</span>
      </div>

      {/* Logo splash banner */}
      <div className="h-52 overflow-hidden relative border-b-2 border-[color:var(--line)]">
        <img src={frame15Logo} alt="Hook & Box" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--ink)]/50 to-transparent" />
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="text-white font-mono text-xs font-bold tracking-[0.25em] uppercase">Fresh · Fast · Fuss-free</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">
        <Card className="p-8 text-center">
          <img src={frame19Logo} alt="Hook & Box" className="h-16 w-auto mx-auto object-contain mb-3" />
          <p className="text-sm text-[color:var(--ink)] mt-1 max-w-sm mx-auto leading-relaxed">
            Fresh seafood, delivered to your door in Dasmariñas.
          </p>
          <div className="mt-3"><Tag label="Est. 2026" /></div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex">
            <div className="w-2 bg-[color:var(--coral)] border-r-2 border-[color:var(--line)] shrink-0" />
            <div className="p-6 flex-1">
              <h3 className="font-display font-extrabold text-xl text-[color:var(--ink)] uppercase tracking-tight mb-3">Our Story</h3>
              <p className="text-sm text-[color:var(--muted)] leading-relaxed">
                Hook & Box started with five friends who shared one frustration — why spend time, gas, and effort going to the wet market when fresh seafood should come to you? We built this service to make quality seafood accessible to every household in Dasmariñas, without the hassle.
              </p>
              <p className="text-sm text-[color:var(--muted)] leading-relaxed mt-3">
                We source our catch fresh every morning and deliver straight to your door via Lalamove — so you get the best seafood without leaving home.
              </p>
            </div>
          </div>
        </Card>

        {/* Values strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <IcFish size={22}/>, label: "Fresh Quality", sub: "Sourced daily" },
            { icon: <IcUsers size={22}/>, label: "Community", sub: "Built for Dasma" },
            { icon: <IcTruck size={22}/>, label: "Reliability", sub: "Via Lalamove" },
          ].map(v => (
            <Card key={v.label} className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-[color:var(--aqua)] border-2 border-[color:var(--line)] flex items-center justify-center text-[color:var(--ink)]">{v.icon}</div>
              <p className="text-xs font-bold text-[color:var(--ink)]">{v.label}</p>
              <p className="text-[10px] font-mono text-[color:var(--muted)]">{v.sub}</p>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <div className="flex items-baseline gap-3 mb-1 flex-wrap">
            <h3 className="font-display font-extrabold text-xl text-[color:var(--ink)] uppercase tracking-tight">Meet the Team</h3>
            <span className="eyebrow text-[color:var(--coral-ink)]">{"// PICKE"}</span>
          </div>
          <Divider />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {TEAM.map((member) => (
              <div key={member.name} className="flex flex-col items-center gap-2.5 min-w-[90px] flex-1">
                <div className="w-16 h-16 bg-[color:var(--teal)] border-2 border-[color:var(--line)] shadow-[3px_3px_0_var(--shadow-ink)] flex items-center justify-center text-white font-display font-black text-xl">
                  {member.initial}
                </div>
                <p className="text-sm font-bold text-[color:var(--ink)] text-center">{member.name}</p>
                <p className="text-[10px] font-mono text-[color:var(--muted)] text-center leading-tight">{member.role}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-center">
          <div className="border-2 border-[color:var(--line)] bg-[color:var(--aqua)] shadow-[5px_5px_0_var(--shadow-ink)] px-14 py-7 text-center">
            <p className="text-[10px] font-mono text-[color:var(--ink)]/70 uppercase tracking-[0.3em] font-bold">Established</p>
            <p className="font-display font-black text-6xl text-[color:var(--ink)] leading-none mt-1">2026</p>
            <p className="text-[10px] font-mono text-[color:var(--ink)]/70 uppercase tracking-[0.3em] font-bold mt-2">Dasmariñas City</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Contact View ─────────────────────────────────────────────────────────────

function ContactView({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full bg-[color:var(--paper)] overflow-y-auto">
      <div className="bg-[color:var(--paper)] border-b-2 border-[color:var(--line)] px-4 md:px-6 py-3.5 flex items-center gap-4">
        <button onClick={onBack} className="text-[color:var(--ink)] hover:text-[color:var(--coral)] text-xs font-mono font-bold uppercase tracking-wide transition-colors flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> Back to Shop
        </button>
        <BrandLogo size="sm" />
      </div>

      {/* Teal hero */}
      <div className="bg-[color:var(--teal)] border-b-2 border-[color:var(--line)]">
        <div className="px-4 md:px-8 pt-8 pb-9 text-center">
          <p className="eyebrow text-[color:var(--aqua)] mb-2">{"// Get in Touch"}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-white uppercase tracking-tight mb-1">We&rsquo;d Love to<br />Hear From You</h2>
          <p className="text-white/85 text-sm max-w-sm mx-auto mt-3">Have a question, a special order, or just want to say hi? Reach out through any of the channels below.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8 pb-10">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Contact info */}
          <div className="flex-1 flex flex-col gap-3">
            {[
              {
                icon: <IcFacebook size={20}/>,
                iconBg: "bg-[color:var(--teal)] text-white",
                label: "Facebook Page",
                value: "fb.com/hookandbox",
                action: <button className="mt-2 flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wide text-[color:var(--coral-ink)] hover:underline"><IcFacebook size={11}/> Visit Page →</button>,
              },
              {
                icon: <IcPhone size={20}/>,
                iconBg: "bg-[color:var(--coral)] text-white",
                label: "Phone / SMS",
                value: "0917-XXX-XXXX",
                action: null,
              },
              {
                icon: <IcClock size={20}/>,
                iconBg: "bg-[color:var(--plum)] text-white",
                label: "Operating Hours",
                value: "Mon – Sat · 7:00 AM – 9:00 PM",
                action: null,
              },
              {
                icon: <IcTruck size={20}/>,
                iconBg: "bg-[color:var(--aqua)] text-[color:var(--ink)]",
                label: "Service Area",
                value: "Dasmariñas City only",
                action: null,
              },
            ].map(item => (
              <Card key={item.label} className="p-4 flex items-start gap-4">
                <div className={`w-11 h-11 ${item.iconBg} border-2 border-[color:var(--line)] flex items-center justify-center shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-mono font-bold text-[color:var(--muted)] uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-bold text-[color:var(--ink)] mt-0.5">{item.value}</p>
                  {item.action}
                </div>
              </Card>
            ))}
          </div>

          {/* Message form */}
          <Card className="flex-1 overflow-hidden">
            <div className="bg-[color:var(--teal)] border-b-2 border-[color:var(--line)] px-6 py-4">
              <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-tight">Send a Message</h3>
              <p className="text-xs font-mono text-white/85 mt-0.5">We reply within 24 hours</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div><Label>Name</Label><div className="mt-1"><FieldInput placeholder="Your name" /></div></div>
              <div><Label>Phone Number</Label><div className="mt-1"><FieldInput placeholder="09XX XXX XXXX" /></div></div>
              <div>
                <Label>Message</Label>
                <textarea className="mt-1 w-full border-2 border-[color:var(--line)] rounded-[var(--radius)] px-4 py-3 text-sm text-[color:var(--ink)] placeholder-[color:var(--muted)] outline-none focus:shadow-[3px_3px_0_var(--shadow-ink)] resize-none h-28 transition-shadow bg-white" placeholder="Type your message here…" />
              </div>
              <Btn label="Send Message →" filled full />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

const NAV_ICON: Record<View, React.ReactNode> = {
  client: <IcCart size={13} />,
  admin: <IcGear size={13} />,
  payment: <IcCard size={13} />,
  track: <IcSearch size={13} />,
  about: <IcUsers size={13} />,
  contact: <IcPhone size={13} />,
};

const NAV_VIEWS: [View, string][] = [
  ["client", "Shop"],
  ["admin", "Admin"],
  ["payment", "Checkout"],
  ["track", "Track"],
  ["about", "About"],
  ["contact", "Contact"],
];

export default function StoreApp({ products, categories }: {
  products: Product[];
  categories: Category[];
}) {
  const [view, setView] = useState<View>("client");
  const [checkoutCart, setCheckoutCart] = useState<CartItem[]>([]);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  function handleCheckout(cart: CartItem[]) {
    setCheckoutCart(cart);
    setView("payment");
  }

  // Fallback cart for the Checkout demo view when the user jumps straight to it
  // via the demo nav without adding items. Uses real seeded products if present.
  const defaultCart: CartItem[] = products.slice(0, 2).map(p => ({
    id: p.id, name: p.name, price: p.price, unit: p.unit, qty: 1,
  }));

  return (
    <div className="size-full flex flex-col overflow-hidden">
      {/* Demo navigation bar */}
      <div className="flex items-center bg-[color:var(--ink)] shrink-0 overflow-x-auto border-b-2 border-[color:var(--line)]">
        <span className="text-[10px] text-[color:var(--aqua)] px-4 py-2 font-mono font-bold uppercase tracking-widest whitespace-nowrap hidden lg:block">
          Hook & Box — Prototype
        </span>
        {NAV_VIEWS.map(([v, label]) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wide border-r border-white/10 whitespace-nowrap transition-colors flex items-center gap-1.5 ${view === v ? "bg-[color:var(--coral)] text-white" : "text-[color:var(--aqua)] hover:text-white hover:bg-white/5"}`}>
            {NAV_ICON[v]}{label}
          </button>
        ))}
        <span className="ml-auto text-[10px] font-mono text-[color:var(--muted)] px-4 whitespace-nowrap hidden md:block">Demo Mode</span>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === "client" && <ClientView products={products} categories={categories} onCheckout={handleCheckout} onNavigate={setView} />}
        {view === "admin" && (
          adminUnlocked
            ? <AdminView products={products} onLock={() => setAdminUnlocked(false)} />
            : <AdminLogin onUnlock={() => setAdminUnlocked(true)} />
        )}
        {view === "payment" && (
          <PaymentView
            cart={checkoutCart.length > 0 ? checkoutCart : defaultCart}
            onBack={() => setView("client")}
            onTrack={() => setView("track")}
          />
        )}
        {view === "track" && <TrackOrderView onBack={() => setView("client")} />}
        {view === "about" && <AboutView onBack={() => setView("client")} />}
        {view === "contact" && <ContactView onBack={() => setView("client")} />}
      </div>
    </div>
  );
}

