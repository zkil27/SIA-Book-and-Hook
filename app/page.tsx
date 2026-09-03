"use client";
import { useState } from "react";
const vectorLogo = "/imports/Vector.png";
const frame15Logo = "/imports/Frame_15.png";
const frame151Logo = "/imports/Frame_15-1.png";
const frame19Logo = "/imports/Frame_19.png";

// ─── Brand palette ────────────────────────────────────────────────────────────
// Primary:       #3899AE   buttons, active states
// Primary mid:   #419DB2   hover
// Primary light: #85CDDB   secondary elements
// Accent:        #9CEFE3   tags, badges, highlights
// Surface:       #DFF3F5   page bg, card tints
// White:         #FFFFFF   cards, nav
// Text dark:     #1C4F5A   headings
// Text mid:      #3A6B76   body
// Text muted:    #7AACB8   labels, captions
// Border:        #B8E4EC   card borders, dividers

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
  const sz = small ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm";
  const w = full ? "w-full" : "";
  if (disabled)
    return <button disabled className={`${sz} ${w} bg-[#DFF3F5] text-[#7AACB8] rounded-lg font-medium cursor-not-allowed`}>{label}</button>;
  if (white)
    return <button onClick={onClick} className={`${sz} ${w} bg-white text-[#3899AE] rounded-lg font-semibold hover:bg-[#DFF3F5] transition-colors`}>{label}</button>;
  if (filled || active)
    return <button onClick={onClick} className={`${sz} ${w} bg-[#3899AE] text-white rounded-lg font-semibold hover:bg-[#419DB2] transition-colors`}>{label}</button>;
  if (outline)
    return <button onClick={onClick} className={`${sz} ${w} border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors`}>{label}</button>;
  return <button onClick={onClick} className={`${sz} ${w} bg-white border border-[#3899AE] text-[#3899AE] rounded-lg font-semibold hover:bg-[#DFF3F5] transition-colors`}>{label}</button>;
}

function Tag({ label, color = "accent" }: { label: string; color?: "accent" | "white" | "muted" }) {
  if (color === "white")
    return <span className="inline-block bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">{label}</span>;
  if (color === "muted")
    return <span className="inline-block border border-[#B8E4EC] text-[#7AACB8] text-[10px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wide">{label}</span>;
  return <span className="inline-block bg-[#9CEFE3] text-[#1C4F5A] text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">{label}</span>;
}

function Label({ children, sub = false }: { children: React.ReactNode; sub?: boolean }) {
  if (sub) return <span className="text-xs text-[#7AACB8]">{children}</span>;
  return <span className="text-xs font-semibold text-[#3A6B76] uppercase tracking-wider">{children}</span>;
}

function Divider() {
  return <div className="w-full h-px bg-[#B8E4EC] my-4" />;
}

function FieldInput({ placeholder, value, onChange, type = "text" }: {
  placeholder: string; value?: string; onChange?: (v: string) => void; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange?.(e.target.value)}
      readOnly={!onChange} placeholder={placeholder}
      className="w-full border border-[#B8E4EC] rounded-lg px-4 py-2.5 text-sm text-[#1C4F5A] placeholder-[#7AACB8] bg-white outline-none focus:border-[#3899AE] transition-colors" />
  );
}

function ImgFrame({ label, aspect = "aspect-[4/3]" }: { label?: string; aspect?: string }) {
  return (
    <div className={`w-full ${aspect} bg-gradient-to-br from-[#DFF3F5] to-[#C8EDF3] flex flex-col items-center justify-center gap-1.5 relative overflow-hidden`}>
      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#9CEFE3]/30" />
      <div className="absolute bottom-1 left-1 w-5 h-5 rounded-full bg-[#3899AE]/10" />
      <div className="text-[#85CDDB]"><IcFish size={34} /></div>
      {label && <span className="text-[10px] text-[#85CDDB] font-medium uppercase tracking-wide text-center px-3 leading-tight relative">{label}</span>}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-[#B8E4EC] rounded-2xl ${className}`}>{children}</div>;
}

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

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  { id: 1, name: "Bangus (Milkfish)", category: "Fish", price: 180, unit: "/kg", stock: 42, status: "In Stock" },
  { id: 2, name: "Hipon (Shrimp)", category: "Shellfish", price: 350, unit: "/kg", stock: 18, status: "In Stock" },
  { id: 3, name: "Alimasag (Blue Crab)", category: "Crab", price: 420, unit: "/kg", stock: 9, status: "Low Stock" },
  { id: 4, name: "Pusit (Squid)", category: "Squid", price: 280, unit: "/kg", stock: 25, status: "In Stock" },
  { id: 5, name: "Tilapia", category: "Fish", price: 150, unit: "/kg", stock: 60, status: "In Stock" },
  { id: 6, name: "Tahong (Mussels)", category: "Shellfish", price: 120, unit: "/500g", stock: 4, status: "Low Stock" },
  { id: 7, name: "Talaba (Oysters)", category: "Shellfish", price: 200, unit: "/doz", stock: 0, status: "Out of Stock" },
  { id: 8, name: "Alimango (Mud Crab)", category: "Crab", price: 650, unit: "/kg", stock: 12, status: "In Stock" },
];

const ORDERS = [
  { id: "#HB-001", customer: "Maria Santos", items: "Bangus 2kg, Hipon 1kg", total: 710, status: "Pending", date: "Sep 1, 2026", payment: "GCash" },
  { id: "#HB-002", customer: "Jose Reyes", items: "Pusit 1.5kg, Tilapia 2kg", total: 720, status: "Confirmed", date: "Sep 1, 2026", payment: "COD" },
  { id: "#HB-003", customer: "Ana Cruz", items: "Alimango 1kg", total: 650, status: "Out for Delivery", date: "Aug 31, 2026", payment: "GCash" },
  { id: "#HB-004", customer: "Pedro Lim", items: "Alimasag 2kg, Tahong 500g", total: 960, status: "Delivered", date: "Aug 30, 2026", payment: "GCash" },
];

const CATEGORIES = ["All", "Fish", "Shellfish", "Crab", "Squid"];
const STATUS_STEPS = ["Pending", "Confirmed", "Out for Delivery", "Delivered"];
const TEAM = [
  { name: "Pam", role: "The Visionary", initial: "P", grad: "from-[#3899AE] to-[#9CEFE3]" },
  { name: "Ichan", role: "The Chef Brain", initial: "I", grad: "from-[#2B7D90] to-[#3899AE]" },
  { name: "Chels", role: "The Planner", initial: "C", grad: "from-[#85CDDB] to-[#9CEFE3]" },
  { name: "Kiel", role: "The Negotiator", initial: "K", grad: "from-[#1C4F5A] to-[#3899AE]" },
  { name: "EJ", role: "The Tech Guy", initial: "E", grad: "from-[#419DB2] to-[#85CDDB]" },
];

type CartItem = { id: number; name: string; price: number; unit: string; qty: number };
type View = "client" | "admin" | "payment" | "track" | "about" | "contact";

// ─── Admin Login ──────────────────────────────────────────────────────────────

function AdminLogin({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  function attempt() {
    if (pw === "admin123") { onUnlock(); }
    else { setError(true); setPw(""); }
  }

  return (
    <div className="h-full bg-[#DFF3F5] flex items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8 shadow-lg">
        <div className="text-center mb-7">
          <BrandLogo size="lg" />
          <p className="text-sm text-[#7AACB8] mt-1 font-medium">Admin Portal</p>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <Label sub>Password</Label>
            <div className="mt-1">
              <FieldInput
                type="password" placeholder="Enter admin password"
                value={pw}
                onChange={v => { setPw(v); setError(false); }}
              />
            </div>
            {error && <p className="text-xs text-red-500 mt-1.5">Incorrect password. Please try again.</p>}
          </div>
          <Btn label="Log In" filled full onClick={attempt} />
          <p className="text-center text-xs text-[#7AACB8]">Demo password: <span className="font-mono font-semibold text-[#3899AE]">admin123</span></p>
        </div>
      </Card>
    </div>
  );
}

// ─── Client View ──────────────────────────────────────────────────────────────

function ClientView({ onCheckout, onNavigate }: {
  onCheckout: (cart: CartItem[]) => void;
  onNavigate: (v: View) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = activeCategory === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const deliveryFee = cartTotal >= 500 ? 0 : 50;

  function addToCart(p: typeof PRODUCTS[0]) {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: p.id, name: p.name, price: p.price, unit: p.unit, qty: 1 }];
    });
  }
  function removeFromCart(id: number) { setCart(prev => prev.filter(i => i.id !== id)); }

  const stockColor = (s: string) =>
    s === "In Stock" ? "text-emerald-600" : s === "Low Stock" ? "text-amber-500" : "text-red-500";

  return (
    <div className="flex flex-col h-full bg-[#DFF3F5]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#B8E4EC] px-4 md:px-6 py-3 shrink-0 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo />
          <div className="hidden md:flex items-center gap-7">
            <span className="text-sm font-semibold text-[#3899AE] border-b-2 border-[#3899AE] pb-0.5">Shop</span>
            {(["about","track","contact"] as View[]).map((v, i) => (
              <span key={v} onClick={() => onNavigate(v)}
                className="text-sm text-[#7AACB8] hover:text-[#3899AE] cursor-pointer transition-colors font-medium">
                {["About","Track Order","Contact"][i]}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)}
              className="hidden md:flex items-center gap-1.5 border border-[#B8E4EC] rounded-lg px-3 py-1.5 text-xs text-[#7AACB8] hover:border-[#3899AE] hover:text-[#3899AE] transition-colors">
              <IcSearch size={13} /> Search
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden border border-[#B8E4EC] rounded-lg px-2.5 py-1.5 text-[#3899AE]">
              <IcMenu size={16} />
            </button>
            <button onClick={() => setCartOpen(true)}
              className="flex items-center gap-1.5 bg-[#3899AE] hover:bg-[#419DB2] text-white rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors">
              <IcCart size={14} /> Cart
              {cartCount > 0 && <span className="bg-white text-[#3899AE] font-bold text-[10px] px-1.5 py-0.5 rounded-full">{cartCount}</span>}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-[#B8E4EC] mt-3 pt-3 flex flex-col gap-1">
            <span className="text-sm font-semibold text-[#3899AE] py-1.5 px-1">Shop</span>
            {(["about","track","contact"] as View[]).map((v, i) => (
              <span key={v} onClick={() => { onNavigate(v); setMenuOpen(false); }}
                className="text-sm text-[#3A6B76] py-1.5 px-1 cursor-pointer hover:text-[#3899AE]">
                {["About","Track Order","Contact"][i]}
              </span>
            ))}
          </div>
        )}
      </nav>

      {searchOpen && (
        <div className="bg-white border-b border-[#B8E4EC] px-4 md:px-6 py-3 shrink-0">
          <FieldInput placeholder="Search for bangus, hipon, alimango…" />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto">
          {/* Hero */}
          <div className="relative bg-gradient-to-br from-[#3899AE] via-[#3899AE] to-[#2B7D90] overflow-hidden">
            {/* Decorative bubbles */}
            <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 left-1/4 w-48 h-48 rounded-full bg-[#9CEFE3]/10 blur-3xl pointer-events-none" />
            <div className="px-4 md:px-10 pt-8 pb-4 flex flex-col md:flex-row items-center gap-6 text-white">
              <div className="flex-1">
                <Tag label="Fresh Catch · Dasmariñas" color="white" />
                <h1 className="font-['Russo_One'] text-4xl md:text-5xl text-white leading-tight mt-3 mb-3">
                  Order Fresh<br />Seafood Online
                </h1>
                <p className="text-[#DFF3F5]/90 text-sm md:text-base mb-6 leading-relaxed max-w-sm">
                  Skip the market. Get the freshest catch delivered straight to your door in Dasmariñas City.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Btn label="Order Now" white />
                  <Btn label="View Menu" outline />
                </div>
              </div>
              <div className="w-44 md:w-72 shrink-0 relative flex items-center justify-center">
                <div className="absolute w-40 h-40 md:w-64 md:h-64 rounded-full bg-[#9CEFE3]/20 blur-2xl" />
                <img src={frame151Logo} alt="" aria-hidden="true"
                  className="relative w-full object-contain drop-shadow-2xl animate-float" />
              </div>
            </div>
            {/* Wave divider */}
            <div className="relative h-12 -mb-1">
              <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="#ffffff">
                <path d="M0,24 C240,48 480,0 720,24 C960,48 1200,8 1440,24 L1440,48 L0,48 Z" />
              </svg>
            </div>
          </div>

          {/* Category filter */}
          <div className="mx-4 md:mx-6 mt-5">
            <div className="flex items-end gap-3 mb-1">
              <h2 className="font-['Russo_One'] text-2xl text-[#1C4F5A]">Our Products</h2>
              <div className="w-8 h-1.5 bg-[#9CEFE3] rounded-full mb-1.5" />
            </div>
            <p className="text-xs text-[#7AACB8] mb-4 font-medium">Sourced fresh every morning — Dasmariñas City</p>
            <div className="flex gap-2 mb-5 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setActiveCategory(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${activeCategory === c ? "bg-[#3899AE] text-white shadow-md scale-105" : "bg-white border border-[#B8E4EC] text-[#3A6B76] hover:border-[#3899AE] hover:text-[#3899AE] hover:scale-105"}`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
              {filtered.map(p => (
                <Card key={p.id} className="flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden border-t-2 border-t-[#9CEFE3]">
                  <ImgFrame label={p.name} />
                  <div className="p-4 flex flex-col gap-1 flex-1">
                    <Tag label={p.category} />
                    <p className="text-sm font-semibold text-[#1C4F5A] mt-1.5">{p.name}</p>
                    <p className="text-sm font-bold text-[#3899AE]">₱{p.price}<span className="text-xs font-normal text-[#7AACB8]">{p.unit}</span></p>
                    <p className={`text-[11px] font-semibold ${stockColor(p.status)}`}>● {p.status}</p>
                    <div className="mt-2">
                      <Btn label={p.status === "Out of Stock" ? "Unavailable" : "+ Add to Cart"}
                        filled={p.status !== "Out of Stock"} disabled={p.status === "Out of Stock"}
                        small onClick={() => addToCart(p)} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Why Choose — full-width teal band */}
          <div className="mt-10 relative overflow-hidden">
            {/* Top wave */}
            <div className="h-10 relative">
              <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="#3899AE">
                <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" />
              </svg>
            </div>
            <div className="bg-[#3899AE] px-4 md:px-10 py-8">
              <h2 className="font-['Russo_One'] text-2xl text-white mb-2 text-center">Why Choose Hook&Box?</h2>
              <p className="text-[#DFF3F5]/80 text-xs text-center mb-7 font-medium">Fresh. Fast. Fuss-free.</p>
              <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4">
                {[
                  { icon: <IcHome size={26} />, title: "No Market Trips", desc: "Order from home and skip the commute and the crowd." },
                  { icon: <IcFish size={26} />, title: "Fresh Daily Catch", desc: "Sourced fresh every morning — quality guaranteed." },
                  { icon: <IcTruck size={26} />, title: "Fast Lalamove Delivery", desc: "Delivered straight to your door, same day." },
                ].map(item => (
                  <div key={item.title} className="flex-1 bg-white/10 border border-white/20 rounded-2xl p-5 flex gap-4 items-start backdrop-blur-sm hover:bg-white/15 transition-colors">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shrink-0">{item.icon}</div>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.title}</p>
                      <p className="text-xs text-[#DFF3F5]/80 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Bottom wave */}
            <div className="h-10 relative bg-[#DFF3F5]">
              <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="#3899AE">
                <path d="M0,20 C360,0 1080,40 1440,20 L1440,0 L0,0 Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Cart drawer */}
        {cartOpen && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col md:static md:inset-auto md:z-auto md:w-80 md:shrink-0 md:border-l md:border-[#B8E4EC]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#B8E4EC]">
              <span className="flex items-center gap-2 font-semibold text-[#1C4F5A]">
                <IcCart size={16} className="text-[#3899AE]" /> Your Cart
              </span>
              <button onClick={() => setCartOpen(false)} className="text-[#7AACB8] hover:text-[#3899AE] text-lg">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-[#DFF3F5]">
              {cart.length === 0 ? (
                <div className="text-center mt-12 flex flex-col items-center gap-3">
                  <div className="text-[#B8E4EC]"><IcFish size={44} /></div>
                  <p className="text-sm text-[#7AACB8]">Your cart is empty.</p>
                  <p className="text-xs text-[#7AACB8]">Add some fresh seafood!</p>
                </div>
              ) : cart.map(item => (
                <Card key={item.id} className="flex items-start gap-3 p-3">
                  <div className="w-12 h-12 bg-[#DFF3F5] rounded-lg border border-[#B8E4EC] flex items-center justify-center text-[#85CDDB] shrink-0">
                    <IcFish size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1C4F5A] truncate">{item.name}</p>
                    <p className="text-[11px] text-[#7AACB8]">₱{item.price} {item.unit} × {item.qty}</p>
                    <p className="text-sm font-bold text-[#3899AE]">₱{item.price * item.qty}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-[#7AACB8] hover:text-red-400 text-sm mt-0.5">✕</button>
                </Card>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-[#B8E4EC] bg-white">
              <div className="flex justify-between text-sm text-[#3A6B76] mb-1"><span>Subtotal</span><span>₱{cartTotal}</span></div>
              <div className="flex justify-between text-xs text-[#7AACB8] mb-1">
                <span>Delivery (Lalamove)</span>
                <span className="flex items-center gap-1">
                  {deliveryFee === 0
                    ? <><span className="text-emerald-600 font-semibold">FREE</span></>
                    : `₱${deliveryFee}`}
                </span>
              </div>
              {deliveryFee > 0 && <p className="text-[10px] text-[#7AACB8] mb-2">Free delivery on orders ₱500+</p>}
              <div className="flex justify-between font-bold text-[#1C4F5A] text-base mb-4 pt-2 border-t border-[#B8E4EC]">
                <span>Total</span><span className="text-[#3899AE]">₱{cartTotal + deliveryFee}</span>
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

function AdminView({ onLock }: { onLock: () => void }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "orders">("dashboard");
  const [inventory, setInventory] = useState(PRODUCTS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState("");

  function saveStock(id: number) {
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

  const tabs = [
    { key: "dashboard" as const, icon: <IcChart size={15} />, label: "Dashboard" },
    { key: "inventory" as const, icon: <IcBox size={15} />, label: "Inventory" },
    { key: "orders" as const, icon: <IcDoc size={15} />, label: "Orders" },
  ];

  const stockColor = (s: string) =>
    s === "In Stock" ? "text-emerald-600" : s === "Low Stock" ? "text-amber-500" : "text-red-500";

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#DFF3F5]">
      {/* Mobile tab strip */}
      <div className="md:hidden flex bg-[#1C4F5A] shrink-0 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-5 py-3 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === t.key ? "bg-[#3899AE] text-white" : "text-[#85CDDB] hover:text-white"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-[#1C4F5A] flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <BrandLogo size="md" />
          <p className="text-[10px] text-[#85CDDB] mt-1 uppercase tracking-widest">Admin Portal</p>
        </div>
        <nav className="flex flex-col py-3 gap-0.5 flex-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`text-left px-5 py-3 text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === t.key ? "bg-[#3899AE] text-white" : "text-[#85CDDB] hover:bg-white/5 hover:text-white"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-[10px] text-[#85CDDB] mb-2">Logged in as Admin</p>
          <button onClick={onLock} className="w-full text-xs border border-white/20 text-[#85CDDB] hover:border-white hover:text-white py-2 rounded-lg transition-colors">
            Log Out
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 md:px-8 py-6">

          {activeTab === "dashboard" && (
            <>
              <h2 className="font-['Russo_One'] text-2xl text-[#1C4F5A] mb-5">Dashboard</h2>

              {lowItems.length > 0 && (
                <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-sm text-amber-700 font-medium flex items-center gap-2">
                    <IcWarning size={16} className="text-amber-500 shrink-0" />
                    {lowItems.length} item{lowItems.length > 1 ? "s" : ""} need attention: {lowItems.map(i => i.name).join(", ")}
                  </p>
                  <button onClick={() => setActiveTab("inventory")} className="text-xs underline text-amber-600 whitespace-nowrap font-semibold">
                    Go to Inventory →
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Orders Today", value: "24", sub: "Sep 1, 2026", icon: <IcDoc size={18} className="text-[#3899AE]" />, accent: "border-l-[#3899AE]", valColor: "text-[#3899AE]" },
                  { label: "Revenue Today", value: "₱12,480", sub: "+8% vs yesterday", icon: <IcPeso size={18} className="text-emerald-500" />, accent: "border-l-emerald-400", valColor: "text-emerald-600" },
                  { label: "Stock Alerts", value: String(lowItems.length), sub: "Low / out of stock", icon: <IcWarning size={18} className="text-amber-500" />, accent: "border-l-amber-400", valColor: "text-amber-500" },
                  { label: "Pending Orders", value: String(pending), sub: "Needs confirmation", icon: <IcClock size={18} className="text-[#85CDDB]" />, accent: "border-l-[#85CDDB]", valColor: "text-[#3899AE]" },
                ].map(card => (
                  <Card key={card.label} className={`p-5 border-l-4 ${card.accent} hover:shadow-md transition-shadow`}>
                    <div className="flex items-start justify-between">
                      <Label>{card.label}</Label>
                      {card.icon}
                    </div>
                    <p className={`font-['Russo_One'] text-2xl mt-1 ${card.valColor}`}>{card.value}</p>
                    <Label sub>{card.sub}</Label>
                  </Card>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="p-5">
                  <Label>Sales This Week</Label>
                  <div className="flex items-end gap-2 mt-4 h-32">
                    {[40, 65, 55, 80, 90, 70, 48].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-md bg-[#3899AE] hover:bg-[#419DB2] transition-colors" style={{ height: `${h}%` }} />
                        <span className="text-[9px] text-[#7AACB8] font-medium">{["M","T","W","T","F","S","S"][i]}</span>
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
                        <span className="text-xs text-[#3A6B76] font-medium w-20">{item.name}</span>
                        <div className="flex-1 h-2.5 bg-[#DFF3F5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#3899AE] rounded-full" style={{ width: `${item.pct}%` }} />
                        </div>
                        <span className="text-[10px] text-[#7AACB8] w-8 text-right">{item.pct}%</span>
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
                      <tr className="border-b border-[#B8E4EC]">
                        {["Order ID","Customer","Total","Payment","Status"].map(h => (
                          <th key={h} className="text-left text-[11px] text-[#7AACB8] font-semibold uppercase tracking-wider pb-2 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ORDERS.map(o => (
                        <tr key={o.id} className="border-b border-[#DFF3F5] hover:bg-[#F5FBFC]">
                          <td className="py-3 pr-4 text-xs font-mono font-bold text-[#3899AE]">{o.id}</td>
                          <td className="py-3 pr-4 text-xs text-[#3A6B76] font-medium">{o.customer}</td>
                          <td className="py-3 pr-4 text-xs font-bold text-[#1C4F5A]">₱{o.total}</td>
                          <td className="py-3 pr-4"><Tag label={o.payment} /></td>
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
                <h2 className="font-['Russo_One'] text-2xl text-[#1C4F5A]">Inventory</h2>
                <Btn label="+ Add Product" filled small />
              </div>
              <div className="flex gap-3 mb-4 flex-wrap">
                <div className="flex-1 min-w-[160px]"><FieldInput placeholder="Search products…" /></div>
                <Btn label="Filter" small />
              </div>
              <Card className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#B8E4EC] bg-[#F5FBFC]">
                      {["#","Product","Category","Price","Unit","Stock","Status","Actions"].map(h => (
                        <th key={h} className="text-left text-[11px] text-[#7AACB8] font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(p => (
                      <tr key={p.id} className="border-b border-[#DFF3F5] hover:bg-[#F5FBFC] transition-colors">
                        <td className="px-5 py-3 text-xs text-[#7AACB8]">{p.id}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-[#1C4F5A]">{p.name}</td>
                        <td className="px-5 py-3"><Tag label={p.category} /></td>
                        <td className="px-5 py-3 text-sm font-bold text-[#3899AE]">₱{p.price}</td>
                        <td className="px-5 py-3 text-xs text-[#7AACB8]">{p.unit}</td>
                        <td className="px-5 py-3">
                          {editingId === p.id ? (
                            <div className="flex gap-1.5 items-center">
                              <input autoFocus value={editStock} onChange={e => setEditStock(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && saveStock(p.id)}
                                className="border border-[#B8E4EC] rounded-lg px-2 py-1 text-xs w-16 outline-none focus:border-[#3899AE]" />
                              <Btn label="Save" filled small onClick={() => saveStock(p.id)} />
                            </div>
                          ) : (
                            <span className={`text-sm font-bold ${p.stock === 0 ? "text-red-500" : p.stock <= 10 ? "text-amber-500" : "text-[#1C4F5A]"}`}>{p.stock}</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[11px] font-semibold ${p.status === "In Stock" ? "text-emerald-600" : p.status === "Low Stock" ? "text-amber-500" : "text-red-500"}`}>
                            ● {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-3">
                            <button onClick={() => { setEditingId(p.id); setEditStock(String(p.stock)); }}
                              className="text-xs text-[#3899AE] hover:underline font-semibold">Edit</button>
                            <button className="text-xs text-red-400 hover:underline font-semibold">Remove</button>
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
                <h2 className="font-['Russo_One'] text-2xl text-[#1C4F5A]">Orders</h2>
                <div className="flex gap-2 flex-wrap">
                  {["All","Pending","Confirmed","Out for Delivery","Delivered"].map(s => (
                    <button key={s} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${s === "All" ? "bg-[#3899AE] text-white" : "bg-white border border-[#B8E4EC] text-[#3A6B76] hover:border-[#3899AE]"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {ORDERS.map(o => (
                  <Card key={o.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-sm font-bold text-[#3899AE]">{o.id}</span>
                        <Tag label={o.status} color={o.status === "Delivered" ? "muted" : "accent"} />
                        <Tag label={o.payment} color="muted" />
                        <Tag label="Lalamove" color="muted" />
                      </div>
                      <p className="text-sm font-semibold text-[#1C4F5A]">{o.customer}</p>
                      <p className="text-xs text-[#7AACB8] mt-0.5">{o.items}</p>
                      <p className="text-[10px] text-[#7AACB8] mt-1">{o.date}</p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <p className="font-['Russo_One'] text-xl text-[#3899AE]">₱{o.total}</p>
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
        </div>
      </div>
    </div>
  );
}

// ─── Payment View ─────────────────────────────────────────────────────────────

function PaymentView({ cart, onBack, onTrack }: { cart: CartItem[]; onBack: () => void; onTrack: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [method, setMethod] = useState<"GCash" | "COD" | "">("");
  const [payError, setPayError] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + deliveryFee;

  const STEP_LABELS = ["Order Review", "Delivery Info", "Payment", "Confirmation"];
  const STEP_ICONS = [<IcDoc size={16}/>, <IcTruck size={16}/>, <IcCard size={16}/>, <IcCheckCircle size={16}/>];

  return (
    <div className="h-full bg-[#DFF3F5] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#B8E4EC] px-4 md:px-6 py-3.5 flex items-center gap-4 shadow-sm">
        <button onClick={onBack} className="text-[#7AACB8] hover:text-[#3899AE] text-sm transition-colors flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> Back
        </button>
        <BrandLogo size="sm" />
        <span className="text-sm text-[#7AACB8] font-medium">Checkout</span>
      </div>

      {/* Step indicators */}
      <div className="bg-white border-b border-[#B8E4EC] py-5 overflow-x-auto shadow-sm">
        <div className="flex items-center justify-center px-6 gap-0">
          {STEP_LABELS.map((label, idx) => {
            const n = idx + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={n} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${done ? "border-[#3899AE] bg-[#3899AE] text-white shadow-md" : active ? "border-[#3899AE] bg-white text-[#3899AE] shadow-sm" : "border-[#B8E4EC] bg-white text-[#B8E4EC]"}`}>
                    {done ? <IcCheckCircle size={17}/> : STEP_ICONS[idx]}
                  </div>
                  <span className={`text-[10px] hidden sm:block whitespace-nowrap font-semibold transition-colors ${active ? "text-[#3899AE]" : done ? "text-[#85CDDB]" : "text-[#B8E4EC]"}`}>{label}</span>
                </div>
                {idx < 3 && (
                  <div className={`w-10 md:w-20 h-0.5 mx-1 md:mx-2 mb-5 rounded-full transition-all duration-500 ${done ? "bg-gradient-to-r from-[#3899AE] to-[#85CDDB]" : "bg-[#B8E4EC]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4">

          {step === 1 && (
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-[#3899AE] to-[#419DB2] px-6 py-4 flex items-center justify-between">
                <h3 className="font-['Russo_One'] text-lg text-white">Order Summary</h3>
                <Tag label={`${cart.length} item${cart.length !== 1 ? "s" : ""}`} color="white" />
              </div>
              <div className="p-6 flex flex-col gap-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-[#F5FBFC] border border-[#DFF3F5] hover:border-[#B8E4EC] transition-colors">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#DFF3F5] to-[#C8EDF3] rounded-xl flex items-center justify-center text-[#85CDDB] shrink-0">
                      <IcFish size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1C4F5A] truncate">{item.name}</p>
                      <p className="text-xs text-[#7AACB8] mt-0.5">₱{item.price} {item.unit} × {item.qty}</p>
                    </div>
                    <span className="font-['Russo_One'] text-base text-[#3899AE] shrink-0">₱{item.price * item.qty}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-end"><Btn label="Continue →" filled onClick={() => setStep(2)} /></div>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-[#3899AE] to-[#419DB2] px-6 py-4">
                <h3 className="font-['Russo_One'] text-lg text-white">Delivery Information</h3>
                <p className="text-xs text-[#DFF3F5]/80 mt-0.5">Where should we deliver your order?</p>
              </div>
              <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-[#F5FBFC] border border-[#B8E4EC] rounded-xl px-4 py-3">
                <div className="w-8 h-8 bg-[#3899AE] rounded-lg flex items-center justify-center text-white shrink-0"><IcTruck size={16}/></div>
                <div>
                  <p className="text-xs font-semibold text-[#1C4F5A]">Delivered via Lalamove</p>
                  <p className="text-[10px] text-[#7AACB8]">We book your rider once your order is confirmed.</p>
                </div>
              </div>
                <div className="flex gap-3 flex-col sm:flex-row">
                  <div className="flex-1"><Label sub>First Name</Label><div className="mt-1"><FieldInput placeholder="Maria" /></div></div>
                  <div className="flex-1"><Label sub>Last Name</Label><div className="mt-1"><FieldInput placeholder="Santos" /></div></div>
                </div>
                <div><Label sub>Phone Number</Label><div className="mt-1"><FieldInput placeholder="09XX XXX XXXX" /></div></div>
                <div><Label sub>Street Address</Label><div className="mt-1"><FieldInput placeholder="Block 5, Lot 12, Poblacion…" /></div></div>
                <div className="flex gap-3 flex-col sm:flex-row">
                  <div className="flex-1"><Label sub>Barangay</Label><div className="mt-1"><FieldInput placeholder="Salawag" /></div></div>
                  <div className="flex-1"><Label sub>City</Label><div className="mt-1"><FieldInput placeholder="Dasmariñas" /></div></div>
                </div>
                <div>
                  <Label sub>Courier</Label>
                  <div className="mt-1 flex items-center gap-2 bg-[#DFF3F5] border border-[#B8E4EC] rounded-lg px-4 py-2.5">
                    <Tag label="Lalamove" />
                    <span className="text-xs text-[#7AACB8]">Our team will book your delivery once your order is confirmed.</span>
                  </div>
                </div>
                <div>
                  <Label sub>Preferred Delivery Time</Label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {["6–8 AM","8–10 AM","10–12 PM"].map((t, i) => (
                      <button key={t} className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${i === 0 ? "bg-[#3899AE] text-white border-[#3899AE]" : "bg-white border-[#B8E4EC] text-[#3A6B76] hover:border-[#3899AE]"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label sub>Delivery Notes (Optional)</Label>
                  <textarea className="mt-1 w-full border border-[#B8E4EC] rounded-lg px-4 py-2.5 text-sm text-[#1C4F5A] placeholder-[#7AACB8] outline-none focus:border-[#3899AE] resize-none h-16" placeholder="e.g. Please clean the fish" />
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
              <div className="bg-gradient-to-r from-[#3899AE] to-[#419DB2] px-6 py-4">
                <h3 className="font-['Russo_One'] text-lg text-white">Payment Method</h3>
                <p className="text-xs text-[#DFF3F5]/80 mt-0.5">Choose how you want to pay</p>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <button onClick={() => { setMethod("GCash"); setPayError(false); }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${method === "GCash" ? "border-[#3899AE] bg-gradient-to-r from-[#DFF3F5] to-white shadow-md" : "border-[#B8E4EC] bg-white hover:border-[#85CDDB] hover:shadow-sm"}`}>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors ${method === "GCash" ? "bg-[#3899AE] text-white" : "bg-[#DFF3F5] text-[#3899AE]"}`}>
                      <IcGcash size={26} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#1C4F5A]">GCash</p>
                      <p className="text-xs text-[#7AACB8] mt-0.5">Scan QR or send to our registered number</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${method === "GCash" ? "border-[#3899AE] bg-[#3899AE]" : "border-[#B8E4EC]"}`}>
                      {method === "GCash" && <IcCheckCircle size={14} className="text-white" />}
                    </div>
                  </button>

                  <button onClick={() => { setMethod("COD"); setPayError(false); }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${method === "COD" ? "border-[#3899AE] bg-gradient-to-r from-[#DFF3F5] to-white shadow-md" : "border-[#B8E4EC] bg-white hover:border-[#85CDDB] hover:shadow-sm"}`}>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors ${method === "COD" ? "bg-[#3899AE] text-white" : "bg-[#DFF3F5] text-[#3899AE]"}`}>
                      <IcCash size={26} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#1C4F5A]">Cash on Delivery</p>
                      <p className="text-xs text-[#7AACB8] mt-0.5">Pay the Lalamove rider upon delivery</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${method === "COD" ? "border-[#3899AE] bg-[#3899AE]" : "border-[#B8E4EC]"}`}>
                      {method === "COD" && <IcCheckCircle size={14} className="text-white" />}
                    </div>
                  </button>
                </div>

                {method === "GCash" && (
                  <div className="rounded-2xl overflow-hidden border border-[#B8E4EC]">
                    <div className="bg-[#3899AE] px-4 py-2.5 flex items-center gap-2">
                      <IcGcash size={14} className="text-white" />
                      <span className="text-xs font-bold text-white tracking-wide uppercase">GCash Payment Details</span>
                    </div>
                    <div className="p-4 bg-[#F5FBFC] flex flex-col md:flex-row gap-5 items-start">
                      <div className="w-32 h-32 bg-white border-2 border-dashed border-[#B8E4EC] rounded-xl flex flex-col items-center justify-center gap-1 shrink-0">
                        <IcGcash size={28} className="text-[#B8E4EC]" />
                        <span className="text-[10px] text-[#B8E4EC] text-center font-medium">QR Placeholder</span>
                      </div>
                      <div className="flex flex-col gap-2.5 text-sm flex-1">
                        {[
                          ["GCash Number", "0917-XXX-XXXX"],
                          ["Account Name", "Hook & Box"],
                          ["Amount to Send", `₱${total}`],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between items-center py-1.5 border-b border-[#DFF3F5] last:border-0">
                            <span className="text-[#7AACB8] text-xs">{k}</span>
                            <span className={`font-bold ${k === "Amount to Send" ? "text-[#3899AE] text-base font-['Russo_One']" : "text-[#1C4F5A]"}`}>{v}</span>
                          </div>
                        ))}
                        <div className="mt-1 border-2 border-dashed border-[#B8E4EC] rounded-xl p-3 bg-white text-center cursor-pointer hover:border-[#3899AE] transition-colors group">
                          <p className="text-xs text-[#7AACB8] group-hover:text-[#3899AE] flex items-center justify-center gap-1.5 transition-colors">
                            <IcUpload size={13} /> Upload proof of payment
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {method === "COD" && (
                  <div className="rounded-2xl overflow-hidden border border-[#B8E4EC]">
                    <div className="bg-[#3899AE] px-4 py-2.5 flex items-center gap-2">
                      <IcCash size={14} className="text-white" />
                      <span className="text-xs font-bold text-white tracking-wide uppercase">Cash on Delivery</span>
                    </div>
                    <div className="p-5 bg-[#F5FBFC] flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#DFF3F5] rounded-xl flex items-center justify-center text-[#3899AE] shrink-0">
                        <IcCash size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-[#3A6B76] leading-relaxed">
                          Prepare <strong className="text-[#3899AE] font-['Russo_One'] text-base">₱{total}</strong> in cash. Our Lalamove rider will collect payment upon delivery.
                        </p>
                        <p className="text-xs text-[#7AACB8] mt-2 flex items-center gap-1.5">
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
                {payError && <p className="text-xs text-red-500 text-right font-medium -mt-2">Please select a payment method to continue.</p>}
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-8 text-center overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3899AE] via-[#9CEFE3] to-[#3899AE]" />
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#9CEFE3]/20 blur-2xl pointer-events-none" />
              <div className="w-20 h-20 bg-gradient-to-br from-[#DFF3F5] to-[#B8E4EC] rounded-full flex items-center justify-center mx-auto text-[#3899AE] mb-4 shadow-lg ring-4 ring-[#9CEFE3]/40">
                <IcCheckCircle size={42} />
              </div>
              <h3 className="font-['Russo_One'] text-2xl shimmer-text">Order Placed!</h3>
              <p className="text-sm text-[#7AACB8] mt-1">Your order <strong className="text-[#3899AE] font-mono">#HB-005</strong> has been received.</p>
              <Divider />
              <div className="text-left">
                <Label>Order Details</Label>
                <div className="flex flex-col gap-2 mt-3 text-sm">
                  {[
                    ["Order ID", <span className="font-mono font-bold text-[#3899AE]">#HB-005</span>],
                    ["Payment", method || "COD"],
                    ["Courier", <Tag label="Lalamove" />],
                    ["Status", <Tag label="Pending Confirmation" />],
                    ["Est. Delivery", "Tomorrow, 6–8 AM"],
                    ["Total Paid", <span className="font-['Russo_One'] text-[#3899AE]">₱{total}</span>],
                  ].map(([k, v], i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-[#DFF3F5] last:border-0">
                      <span className="text-[#7AACB8]">{k}</span>
                      <span className="text-[#1C4F5A] font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-[#DFF3F5] border border-[#B8E4EC] rounded-xl p-3 flex items-start gap-2 text-xs text-[#7AACB8] leading-relaxed">
                  <IcTruck size={14} className="text-[#3899AE] shrink-0 mt-0.5" />
                  Our team will book your Lalamove pickup once your order is confirmed. You will receive an SMS with delivery updates.
                </div>
              </div>
              <Divider />
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={onTrack}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm bg-white border border-[#3899AE] text-[#3899AE] rounded-lg font-semibold hover:bg-[#DFF3F5] transition-colors">
                  <IcSearch size={14} /> Track My Order
                </button>
                <Btn label="Back to Shop" filled onClick={onBack} />
              </div>
            </Card>
          )}
        </div>

        {/* Price sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <Card className="p-5 md:sticky md:top-4">
            <Label>Price Breakdown</Label>
            <Divider />
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-xs text-[#3A6B76] mb-1.5">
                <span className="truncate pr-2">{item.name} ×{item.qty}</span>
                <span className="shrink-0 font-medium">₱{item.price * item.qty}</span>
              </div>
            ))}
            <Divider />
            <div className="flex justify-between text-xs text-[#7AACB8] mb-1.5"><span>Subtotal</span><span>₱{subtotal}</span></div>
            <div className="flex justify-between text-xs text-[#7AACB8] mb-1.5">
              <span>Delivery (Lalamove)</span>
              <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-semibold">Free</span> : `₱${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-[#1C4F5A] text-base mt-3 pt-3 border-t border-[#B8E4EC]">
              <span>Total</span><span className="text-[#3899AE] font-['Russo_One']">₱{total}</span>
            </div>
          </Card>
        </div>
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

  const STATUS_ICONS = [<IcClock size={17}/>, <IcCheckCircle size={17}/>, <IcTruck size={17}/>, <IcBox size={17}/>];

  return (
    <div className="h-full bg-[#DFF3F5] overflow-y-auto">
      <div className="bg-white border-b border-[#B8E4EC] px-4 md:px-6 py-3.5 flex items-center gap-4 shadow-sm">
        <button onClick={onBack} className="text-[#7AACB8] hover:text-[#3899AE] text-sm transition-colors flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> Back to Shop
        </button>
        <BrandLogo size="sm" />
      </div>

      {/* Teal hero with search */}
      <div className="relative bg-gradient-to-br from-[#3899AE] to-[#2B7D90] overflow-hidden">
        <div className="absolute top-2 right-6 w-28 h-28 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="px-4 md:px-8 pt-8 pb-12">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <IcSearch size={16} className="text-[#9CEFE3]" />
              <span className="text-[#9CEFE3] text-xs font-bold uppercase tracking-widest">Order Tracker</span>
            </div>
            <h2 className="font-['Russo_One'] text-3xl text-white mb-1">Track Your Order</h2>
            <p className="text-[#DFF3F5]/80 text-sm mb-5">Enter your Order ID to see live status updates.</p>
            <div className="flex gap-2">
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleTrack()}
                placeholder="#HB-001"
                className="flex-1 bg-white/15 border border-white/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:bg-white/20 focus:border-white/60 transition-all font-medium" />
              <button onClick={handleTrack}
                className="bg-white text-[#3899AE] font-bold text-sm px-5 py-3 rounded-xl hover:bg-[#DFF3F5] transition-colors shrink-0">
                Track →
              </button>
            </div>
            <p className="text-white/40 text-[11px] mt-2">Try: #HB-001, #HB-002, #HB-003, or #HB-004</p>
          </div>
        </div>
        <div className="h-8 relative">
          <svg viewBox="0 0 1440 32" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="#DFF3F5">
            <path d="M0,16 C360,32 1080,0 1440,16 L1440,32 L0,32 Z" />
          </svg>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4 pb-10 flex flex-col gap-4">
        {result === "not-found" && (
          <Card className="p-5 text-center overflow-hidden">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 text-red-400">
              <IcXCircle size={22} />
            </div>
            <p className="text-sm font-bold text-red-500">Order not found</p>
            <p className="text-xs text-red-400 mt-1">Double-check your Order ID and try again.</p>
          </Card>
        )}

        {result && result !== "not-found" && (
          <>
            {/* Status card */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-[#3899AE] to-[#419DB2] px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-widest">Order Status</span>
                <Tag label={result.status} color="white" />
              </div>
              <div className="px-5 pt-6 pb-5">
                <div className="flex items-start gap-0">
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s} className="flex items-center flex-1 min-w-0">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="relative flex items-center justify-center">
                          {i === stepIndex && (
                            <span className="absolute w-11 h-11 rounded-full border-2 border-[#3899AE] animate-ping-slow" />
                          )}
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300 relative ${
                            i < stepIndex ? "bg-[#3899AE] border-[#3899AE] text-white shadow-lg"
                            : i === stepIndex ? "bg-white border-[#3899AE] text-[#3899AE] shadow-md"
                            : "bg-white border-[#B8E4EC] text-[#B8E4EC]"
                          }`}>
                            {i < stepIndex ? <IcCheckCircle size={18}/> : STATUS_ICONS[i]}
                          </div>
                        </div>
                        <span className={`text-[10px] text-center whitespace-nowrap font-semibold px-0.5 ${i <= stepIndex ? "text-[#3899AE]" : "text-[#B8E4EC]"}`}>{s}</span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`h-0.5 w-4 md:w-5 mb-6 rounded-full shrink-0 transition-all duration-500 ${i < stepIndex ? "bg-gradient-to-r from-[#3899AE] to-[#85CDDB]" : "bg-[#B8E4EC]"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Order details card */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-[#3899AE] to-[#419DB2] px-5 py-3">
                <span className="text-xs font-bold text-white uppercase tracking-widest">Order Details</span>
              </div>
              <div className="p-5 flex flex-col gap-0">
                {([
                  { icon: <IcDoc size={13}/>, label: "Order ID", value: <span className="font-mono font-bold text-[#3899AE]">{result.id}</span> },
                  { icon: <IcUsers size={13}/>, label: "Customer", value: result.customer },
                  { icon: <IcFish size={13}/>, label: "Items", value: <span className="text-right text-xs leading-snug max-w-[160px]">{result.items}</span> },
                  { icon: <IcClock size={13}/>, label: "Date Placed", value: result.date },
                  { icon: <IcCard size={13}/>, label: "Payment", value: result.payment },
                  { icon: <IcTruck size={13}/>, label: "Courier", value: <Tag label="Lalamove" /> },
                  { icon: <IcCheckCircle size={13}/>, label: "Status", value: <Tag label={result.status} color={result.status === "Delivered" ? "muted" : "accent"} /> },
                  { icon: <IcPeso size={13}/>, label: "Total", value: <span className="font-['Russo_One'] text-[#3899AE]">₱{result.total}</span> },
                ] as const).map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#DFF3F5] last:border-0 text-sm">
                    <span className="flex items-center gap-2 text-[#7AACB8]">
                      <span className="text-[#B8E4EC]">{row.icon}</span>{row.label}
                    </span>
                    <span className="text-[#1C4F5A] font-medium text-right">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5">
                <button disabled
                  className="w-full border-2 border-dashed border-[#B8E4EC] rounded-xl bg-[#F5FBFC] text-[#7AACB8] text-sm py-3 cursor-not-allowed flex items-center justify-center gap-2 font-medium">
                  <IcTruck size={15}/> View on Lalamove — Available in Full Version
                </button>
                <p className="text-[10px] text-[#7AACB8] text-center mt-1.5">
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
    <div className="h-full bg-[#DFF3F5] overflow-y-auto">
      <div className="bg-white border-b border-[#B8E4EC] px-4 md:px-6 py-3.5 flex items-center gap-4 shadow-sm">
        <button onClick={onBack} className="text-[#7AACB8] hover:text-[#3899AE] text-sm transition-colors">← Back to Shop</button>
        <BrandLogo size="sm" />
        <span className="text-sm text-[#7AACB8] font-medium">About Us</span>
      </div>

      {/* Logo splash banner */}
      <div className="h-52 overflow-hidden relative">
        <img src={frame15Logo} alt="Hook & Box" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C4F5A]/40 to-transparent" />
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="text-white/70 text-xs font-medium tracking-[0.25em] uppercase">Fresh · Fast · Fuss-free</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6 -mt-6">
        <Card className="p-8 text-center">
          <img src={frame19Logo} alt="Hook & Box" className="h-16 w-auto mx-auto object-contain rounded-xl mb-3" />
          <p className="text-sm text-[#3A6B76] mt-1 max-w-sm mx-auto leading-relaxed">
            Fresh seafood, delivered to your door in Dasmariñas.
          </p>
          <div className="mt-3"><Tag label="Est. 2026" /></div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex">
            <div className="w-1.5 bg-gradient-to-b from-[#3899AE] to-[#9CEFE3] shrink-0 rounded-l-2xl" />
            <div className="p-6 flex-1">
              <h3 className="font-['Russo_One'] text-lg text-[#1C4F5A] mb-3">Our Story</h3>
              <p className="text-sm text-[#3A6B76] leading-relaxed">
                Hook & Box started with five friends who shared one frustration — why spend time, gas, and effort going to the wet market when fresh seafood should come to you? We built this service to make quality seafood accessible to every household in Dasmariñas, without the hassle.
              </p>
              <p className="text-sm text-[#3A6B76] leading-relaxed mt-3">
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
            <Card key={v.label} className="p-4 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-br from-[#DFF3F5] to-[#B8E4EC] rounded-xl flex items-center justify-center text-[#3899AE]">{v.icon}</div>
              <p className="text-xs font-bold text-[#1C4F5A]">{v.label}</p>
              <p className="text-[10px] text-[#7AACB8]">{v.sub}</p>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-gradient-to-br from-white to-[#F5FBFC]">
          <div className="flex items-baseline gap-3 mb-1">
            <h3 className="font-['Russo_One'] text-lg text-[#1C4F5A]">Meet the Team</h3>
            <span className="text-sm font-bold tracking-widest text-[#9CEFE3]">PICKE</span>
          </div>
          <Divider />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {TEAM.map((member, idx) => (
              <div key={member.name} className="flex flex-col items-center gap-2.5 min-w-[90px] flex-1 group">
                <div className={`w-16 h-16 bg-gradient-to-br ${member.grad} rounded-2xl flex items-center justify-center text-white font-['Russo_One'] text-xl shadow-lg ring-2 ring-white ring-offset-2 group-hover:scale-110 group-hover:shadow-xl transition-all duration-200`}>
                  {member.initial}
                </div>
                <p className="text-sm font-semibold text-[#1C4F5A] text-center">{member.name}</p>
                <p className="text-[10px] text-[#7AACB8] text-center leading-tight">{member.role}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-center">
          <div className="relative border-2 border-[#3899AE] px-14 py-7 text-center rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#DFF3F5] to-[#EAF8FA] -z-10" />
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-[#9CEFE3]/30" />
            <div className="absolute -bottom-3 -left-3 w-10 h-10 rounded-full bg-[#3899AE]/10" />
            <p className="text-[10px] text-[#7AACB8] uppercase tracking-[0.3em] font-medium">Established</p>
            <p className="font-['Russo_One'] text-6xl text-[#3899AE] leading-none mt-1 drop-shadow-sm">2026</p>
            <p className="text-[10px] text-[#7AACB8] uppercase tracking-[0.3em] font-medium mt-2">Dasmariñas City</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Contact View ─────────────────────────────────────────────────────────────

function ContactView({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full bg-[#DFF3F5] overflow-y-auto">
      <div className="bg-white border-b border-[#B8E4EC] px-4 md:px-6 py-3.5 flex items-center gap-4 shadow-sm">
        <button onClick={onBack} className="text-[#7AACB8] hover:text-[#3899AE] text-sm transition-colors flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> Back to Shop
        </button>
        <BrandLogo size="sm" />
      </div>

      {/* Teal hero */}
      <div className="relative bg-gradient-to-br from-[#3899AE] to-[#2B7D90] overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="px-4 md:px-8 pt-8 pb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <IcPhone size={14} className="text-[#9CEFE3]" />
            <span className="text-[#9CEFE3] text-xs font-bold uppercase tracking-widest">Get in Touch</span>
          </div>
          <h2 className="font-['Russo_One'] text-3xl text-white mb-1">We'd Love to Hear<br />From You</h2>
          <p className="text-[#DFF3F5]/80 text-sm max-w-sm mx-auto mt-2">Have a question, a special order, or just want to say hi? Reach out to us through any of the channels below.</p>
        </div>
        <div className="h-8 relative">
          <svg viewBox="0 0 1440 32" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="#DFF3F5">
            <path d="M0,16 C360,32 1080,0 1440,16 L1440,32 L0,32 Z" />
          </svg>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-10">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Contact info */}
          <div className="flex-1 flex flex-col gap-3">
            {[
              {
                icon: <IcFacebook size={20}/>,
                iconBg: "bg-[#3899AE]",
                label: "Facebook Page",
                value: "fb.com/hookandbox",
                action: <button className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#3899AE] hover:underline"><IcFacebook size={11}/> Visit Page →</button>,
              },
              {
                icon: <IcPhone size={20}/>,
                iconBg: "bg-[#419DB2]",
                label: "Phone / SMS",
                value: "0917-XXX-XXXX",
                action: null,
              },
              {
                icon: <IcClock size={20}/>,
                iconBg: "bg-[#85CDDB]",
                label: "Operating Hours",
                value: "Mon – Sat · 7:00 AM – 9:00 PM",
                action: null,
              },
              {
                icon: <IcTruck size={20}/>,
                iconBg: "bg-[#9CEFE3] !text-[#1C4F5A]",
                label: "Service Area",
                value: "Dasmariñas City only",
                action: null,
              },
            ].map(item => (
              <Card key={item.label} className="p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 ${item.iconBg} rounded-xl flex items-center justify-center text-white shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-[#7AACB8] uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold text-[#1C4F5A] mt-0.5">{item.value}</p>
                  {item.action}
                </div>
              </Card>
            ))}
          </div>

          {/* Message form */}
          <Card className="flex-1 overflow-hidden">
            <div className="bg-gradient-to-r from-[#3899AE] to-[#419DB2] px-6 py-4">
              <h3 className="font-['Russo_One'] text-lg text-white">Send a Message</h3>
              <p className="text-xs text-[#DFF3F5]/80 mt-0.5">We reply within 24 hours</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div><Label sub>Name</Label><div className="mt-1"><FieldInput placeholder="Your name" /></div></div>
              <div><Label sub>Phone Number</Label><div className="mt-1"><FieldInput placeholder="09XX XXX XXXX" /></div></div>
              <div>
                <Label sub>Message</Label>
                <textarea className="mt-1 w-full border border-[#B8E4EC] rounded-xl px-4 py-3 text-sm text-[#1C4F5A] placeholder-[#7AACB8] outline-none focus:border-[#3899AE] resize-none h-28 transition-colors bg-white" placeholder="Type your message here…" />
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

export default function App() {
  const [view, setView] = useState<View>("client");
  const [checkoutCart, setCheckoutCart] = useState<CartItem[]>([]);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  function handleCheckout(cart: CartItem[]) {
    setCheckoutCart(cart);
    setView("payment");
  }

  const defaultCart: CartItem[] = [
    { id: 1, name: "Bangus (Milkfish)", price: 180, unit: "/kg", qty: 2 },
    { id: 2, name: "Hipon (Shrimp)", price: 350, unit: "/kg", qty: 1 },
  ];

  return (
    <div className="size-full flex flex-col overflow-hidden">
      {/* Demo navigation bar */}
      <div className="flex items-center bg-[#1C4F5A] shrink-0 overflow-x-auto">
        <span className="text-[10px] text-[#7AACB8] px-4 py-2 font-semibold uppercase tracking-widest whitespace-nowrap hidden lg:block">
          Hook & Box — Prototype
        </span>
        {NAV_VIEWS.map(([v, label]) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2.5 text-xs font-semibold border-r border-[#ffffff10] whitespace-nowrap transition-colors flex items-center gap-1.5 ${view === v ? "bg-[#3899AE] text-white" : "text-[#85CDDB] hover:text-white hover:bg-white/5"}`}>
            {NAV_ICON[v]}{label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-[#3A6B76] px-4 whitespace-nowrap hidden md:block">Demo Mode</span>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === "client" && <ClientView onCheckout={handleCheckout} onNavigate={setView} />}
        {view === "admin" && (
          adminUnlocked
            ? <AdminView onLock={() => setAdminUnlocked(false)} />
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

