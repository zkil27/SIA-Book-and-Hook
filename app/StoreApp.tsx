"use client";
import { useState } from "react";

const vectorLogo = "/imports/Vector.png";

// ─── Solar / Linear Iconography ───────────────────────────────────────────────

type Ic = { size?: number; className?: string };

function IcCart({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 2.5H4l2.2 9.5A1.8 1.8 0 0 0 8 13.5h7.5a1.8 1.8 0 0 0 1.75-1.4L18.5 6.5H4.8" />
      <circle cx="8" cy="17" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="17" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IcGear({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2v2.5m0 11V18M2 10h2.5m11 0H18M4.3 4.3l1.8 1.8m7.8 7.8 1.8 1.8M4.3 15.7l1.8-1.8m7.8-7.8 1.8-1.8" />
    </svg>
  );
}
function IcSearch({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="m12.5 12.5 4.5 4.5" />
    </svg>
  );
}
function IcPhone({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 3a1 1 0 0 1 1-.9h2.5l1.2 3-1.8 1.5a9 9 0 0 0 4 4L12 9l3 1.2v2.5a1 1 0 0 1-.9 1A11.5 11.5 0 0 1 3.5 3Z" />
    </svg>
  );
}
function IcUsers({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="6" r="3" />
      <path d="M1.5 18a6 6 0 0 1 12 0M13.5 4a3 3 0 1 1 0 6M18.5 18a5 5 0 0 0-5-5" />
    </svg>
  );
}
function IcCard({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4.5" width="16" height="11" rx="2" />
      <path d="M2 8.5h16M5.5 12.5h3.5" />
    </svg>
  );
}
function IcMenu({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  );
}
function IcFish({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 10a6.5 6.5 0 0 1-9 5.5C4 14 4 12 4 10s0-4 1.5-5.5A6.5 6.5 0 0 1 14.5 10Z" />
      <path d="M14.5 10 19 6.5v7L14.5 10Z" />
      <circle cx="7" cy="9" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IcTruck({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="5" width="11" height="8" rx="1.5" />
      <path d="M12.5 8.5h3.5l2 3v2.5h-5.5V8.5Z" />
      <circle cx="5" cy="15.5" r="1.5" />
      <circle cx="14.5" cy="15.5" r="1.5" />
    </svg>
  );
}
function IcWarning({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2.5 2.5 17h15L10 2.5Z" />
      <path d="M10 8v4" />
      <circle cx="10" cy="14.5" r=".75" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IcDoc({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2.5" width="12" height="15" rx="1.5" />
      <path d="M7 6.5h6M7 10h6M7 13.5h3.5" />
    </svg>
  );
}
function IcPeso({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M5 4h6a4 4 0 0 1 0 8H5M5 8h8M5 12h8M5 4v13" />
    </svg>
  );
}
function IcClock({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l3 2" />
    </svg>
  );
}
function IcCheckCircle({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="m6 10 3 3 5-6" />
    </svg>
  );
}
function IcXCircle({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="10" cy="10" r="8" />
      <path d="m7 7 6 6m0-6-6 6" />
    </svg>
  );
}
function IcBox({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7.5l8 4 8-4M10 11.5v7M3.5 5.5l6.5-3 6.5 3-6.5 3-6.5-3Z" />
    </svg>
  );
}
function IcGcash({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="6" height="6" rx=".5" />
      <rect x="12" y="2" width="6" height="6" rx=".5" />
      <rect x="2" y="12" width="6" height="6" rx=".5" />
      <rect x="3.5" y="3.5" width="3" height="3" rx=".3" fill="currentColor" stroke="none" />
      <rect x="13.5" y="3.5" width="3" height="3" rx=".3" fill="currentColor" stroke="none" />
      <rect x="3.5" y="13.5" width="3" height="3" rx=".3" fill="currentColor" stroke="none" />
      <path d="M13 13h5M13 15.5h3M13 18h5M16 13v5" />
    </svg>
  );
}
function IcCash({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="5.5" width="17" height="9" rx="1.5" />
      <circle cx="10" cy="10" r="2.5" />
      <path d="M5 8.5v3M15 8.5v3" />
    </svg>
  );
}
function IcChart({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 16h16M5 16V11M10 16V7M15 16V4" />
    </svg>
  );
}
function IcTrash({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 5.5h13M7.5 5.5V3.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M15 5.5v11a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 16.5v-11M8 9v5M12 9v5" />
    </svg>
  );
}
function IcSnowflake({ size = 16, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M10 2v16M2 10h16M4.5 4.5l11 11M4.5 15.5l11-11" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );
}
function IcMinus({ size = 14, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 10h12" />
    </svg>
  );
}
function IcPlus({ size = 14, className = "" }: Ic) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

// ─── Image Helper with Banana Pro Integration ────────────────────────────────
function ProductImage({ name, className = "" }: { name: string; className?: string }) {
  const [imgError, setImgError] = useState(false);

  // Map product names to potential Banana Pro generated images
  const n = name.toLowerCase();

  let imgPath = "";
  if (n.includes("bangus") || n.includes("milkfish")) imgPath = "/products/bangus.jpg";
  else if (n.includes("hipon") || n.includes("prawn") || n.includes("shrimp") || n.includes("sugpo")) imgPath = "/products/prawns.jpg";
  else if (n.includes("alimango") || n.includes("alimasag") || n.includes("crab")) imgPath = "/products/crab.jpg";
  else if (n.includes("pusit") || n.includes("squid") || n.includes("octopus")) imgPath = "/products/squid.jpg";
  else if (n.includes("tilapia")) imgPath = "/products/tilapia.jpg";
  else if (n.includes("salmon") || n.includes("tuna")) imgPath = "/products/salmon.jpg";

  if (imgPath && !imgError) {
    return (
      <img
        src={imgPath}
        alt={name}
        onError={() => setImgError(true)}
        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${className}`}
      />
    );
  }

  // Clean fallback when photo is not present
  return (
    <div className="w-full h-full bg-[#F4EFEB] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-12 h-12 rounded-full bg-white border border-[#E5DFD5] flex items-center justify-center text-[color:var(--primary)] shadow-2xs">
        <IcFish size={24} />
      </div>
      <span className="text-[11px] text-gray-500 mt-2 font-medium">
        Fresh Catch
      </span>
    </div>
  );
}

// ─── Shared UI Primitives ─────────────────────────────────────────────────────

function Btn({
  label, filled = false, outline = false, small = false,
  onClick, active = false, disabled = false, white = false, full = false, variant = "primary", className = "",
}: {
  label: string; filled?: boolean; outline?: boolean; small?: boolean;
  onClick?: () => void; active?: boolean; disabled?: boolean; white?: boolean; full?: boolean;
  variant?: "primary" | "coral" | "ocean" | "destructive";
  className?: string;
}) {
  const sz = small ? "px-3.5 py-1.5 text-xs font-semibold" : "px-5 py-2.5 text-sm font-semibold";
  const w = full ? "w-full" : "";
  const base = `${sz} ${w} rounded-[var(--radius-sm)] tracking-tight transition-all duration-150 active:scale-[0.98] inline-flex items-center justify-center gap-1.5 cursor-pointer select-none ${className}`;

  if (disabled) {
    return (
      <button disabled className={`${sz} ${w} rounded-[var(--radius-sm)] border border-gray-200 bg-gray-100 text-gray-400 font-semibold cursor-not-allowed ${className}`}>
        {label}
      </button>
    );
  }
  if (white) {
    return (
      <button onClick={onClick} className={`${base} bg-white text-[color:var(--brand-ink)] border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300`}>
        {label}
      </button>
    );
  }
  if (filled || active) {
    if (variant === "destructive") {
      return (
        <button onClick={onClick} className={`${base} bg-rose-600 text-white border border-transparent shadow-sm hover:bg-rose-700`}>
          {label}
        </button>
      );
    }
    if (variant === "ocean") {
      return (
        <button onClick={onClick} className={`${base} bg-[color:var(--primary)] text-white border border-transparent shadow-sm hover:brightness-105`}>
          {label}
        </button>
      );
    }
    // Sea-Prawn Coral (high conversion primary action)
    return (
      <button onClick={onClick} className={`${base} bg-[color:var(--coral)] text-white border border-transparent shadow-[var(--shadow-coral)] hover:bg-[color:var(--coral-hover)]`}>
        {label}
      </button>
    );
  }
  if (outline) {
    return (
      <button onClick={onClick} className={`${base} bg-white/10 backdrop-blur-sm text-white border border-white/50 hover:bg-white/20`}>
        {label}
      </button>
    );
  }
  return (
    <button onClick={onClick} className={`${base} bg-white text-[color:var(--brand-ink)] border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm`}>
      {label}
    </button>
  );
}

function Tag({
  label, color = "accent",
}: {
  label: string; color?: "accent" | "white" | "muted" | "cyan" | "rose" | "warning" | "gold" | "coral";
}) {
  const base = "inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-[var(--radius-xs)] border leading-tight";
  if (color === "white")
    return <span className={`${base} bg-white/20 text-white border-white/40 backdrop-blur-xs`}>{label}</span>;
  if (color === "muted")
    return <span className={`${base} bg-gray-100 text-gray-700 border-gray-200`}>{label}</span>;
  if (color === "rose")
    return <span className={`${base} bg-rose-50 text-rose-700 border-rose-200`}>{label}</span>;
  if (color === "warning")
    return <span className={`${base} bg-amber-50 text-amber-800 border-amber-200`}>{label}</span>;
  if (color === "gold")
    return <span className={`${base} bg-amber-100 text-amber-900 border-amber-300 font-bold`}>{label}</span>;
  if (color === "coral")
    return <span className={`${base} bg-orange-50 text-orange-800 border-orange-200 font-bold`}>{label}</span>;
  if (color === "cyan")
    return <span className={`${base} bg-cyan-50 text-cyan-800 border-cyan-200`}>{label}</span>;
  return <span className={`${base} bg-[#1F7A8C]/10 text-[#134F5C] border-[#1F7A8C]/20`}>{label}</span>;
}

function Label({ children, sub = false }: { children: React.ReactNode; sub?: boolean }) {
  if (sub) return <span className="text-[11px] text-gray-500 font-normal">{children}</span>;
  return <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-ink)]">{children}</span>;
}

function Divider() {
  return <div className="w-full border-t border-gray-200/80 my-4" />;
}

function FieldInput({
  placeholder, value, onChange, type = "text",
}: {
  placeholder: string; value?: string; onChange?: (v: string) => void; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      readOnly={!onChange}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-[var(--radius-sm)] px-3.5 py-2 text-sm text-[color:var(--brand-ink)] placeholder-gray-400 bg-white outline-none focus:border-[color:var(--coral)] focus:ring-1 focus:ring-[color:var(--coral)] transition-all shadow-xs"
    />
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`market-card ${className}`}>
      {children}
    </div>
  );
}

function BrandLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconCls = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-11 w-11" : "h-8 w-8";
  const textCls = size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-xl";
  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold ${textCls} tracking-tight select-none`}>
      <img src={vectorLogo} alt="Hook & Box" className={`${iconCls} object-contain`} />
      <span>
        <span className="text-[color:var(--primary)]">Hook&amp;</span>
        <span className="text-[color:var(--coral)]">Box</span>
      </span>
    </span>
  );
}

// ─── Data Types ───────────────────────────────────────────────────────────────

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

const ORDERS = [
  { id: "#HB-001", customer: "Maria Santos", items: "Bangus 2kg, Hipon 1kg", total: 710, status: "Pending", date: "Sep 1, 2026", payment: "GCash" },
  { id: "#HB-002", customer: "Jose Reyes", items: "Pusit 1.5kg, Tilapia 2kg", total: 720, status: "Confirmed", date: "Sep 1, 2026", payment: "COD" },
  { id: "#HB-003", customer: "Ana Cruz", items: "Alimango 1kg", total: 650, status: "Out for Delivery", date: "Aug 31, 2026", payment: "GCash" },
  { id: "#HB-004", customer: "Pedro Lim", items: "Alimasag 2kg, Tahong 500g", total: 960, status: "Delivered", date: "Aug 30, 2026", payment: "GCash" },
];

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

type CartItem = { id: string; name: string; price: number; unit: string; qty: number; prep?: string };
type View = "client" | "admin" | "payment" | "track" | "about" | "contact";

// ─── Admin Login ──────────────────────────────────────────────────────────────

function AdminLogin({ onUnlock }: { onUnlock: () => void }) {
  const [user, setUser] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  function attempt() {
    if (user === "admin" && pw === "admin123") {
      onUnlock();
    } else {
      setError(true);
      setPw("");
    }
  }

  return (
    <div className="h-full bg-[#0B1E24] flex items-center justify-center p-6 relative">
      <div className="w-full max-w-sm market-card bg-white p-8 shadow-xl relative z-10">
        <div className="text-center mb-6">
          <BrandLogo size="lg" />
          <p className="text-xs text-gray-500 mt-2 font-medium">Staff Operations Portal</p>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Username</Label>
            <div className="mt-1.5">
              <FieldInput
                placeholder="Enter username"
                value={user}
                onChange={v => { setUser(v); setError(false); }}
              />
            </div>
          </div>
          <div>
            <Label>Password</Label>
            <div className="mt-1.5">
              <FieldInput
                type="password"
                placeholder="Enter admin password"
                value={pw}
                onChange={v => { setPw(v); setError(false); }}
              />
            </div>
            {error && (
              <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <IcWarning size={13} /> Incorrect username or password.
              </p>
            )}
          </div>
          <div className="mt-2">
            <Btn label="Sign In to Portal" filled full onClick={attempt} />
          </div>
          <p className="text-center text-xs text-gray-500 pt-3 border-t border-gray-100">
            Demo Credentials: <span className="font-semibold text-gray-800">admin</span> / <span className="font-semibold text-gray-800">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Storefront Client View (Bustling Coastal Market) ─────────────────────────

function ClientView({
  products, categories, onCheckout, onNavigate,
}: {
  products: Product[];
  categories: Category[];
  onCheckout: (cart: CartItem[]) => void;
  onNavigate: (v: View) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cookingFilter, setCookingFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [basketWiggling, setBasketWiggling] = useState(false);

  const categoryNames = ["All", ...categories.map(c => c.name)];
  const query = search.trim().toLowerCase();

  // Filter products by species, query, and recipe style
  const filtered = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = query === "" ||
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);

    let matchesCooking = true;
    const n = p.name.toLowerCase();
    if (cookingFilter === "sinigang") {
      matchesCooking = n.includes("bangus") || n.includes("hipon") || n.includes("prawn") || n.includes("salmon");
    } else if (cookingFilter === "inihaw") {
      matchesCooking = n.includes("bangus") || n.includes("pusit") || n.includes("tilapia") || n.includes("squid");
    } else if (cookingFilter === "ginataan") {
      matchesCooking = n.includes("alimango") || n.includes("alimasag") || n.includes("hipon") || n.includes("crab");
    } else if (cookingFilter === "kilawin") {
      matchesCooking = n.includes("tuna") || n.includes("tanigue") || n.includes("salmon");
    }

    return matchesCategory && matchesSearch && matchesCooking;
  });

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const deliveryFee = cartTotal >= 500 ? 0 : 50;

  function addToCart(p: Product, prep = "Cleaned & Scaled") {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id && i.prep === prep);
      if (ex) return prev.map(i => i.id === p.id && i.prep === prep ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: p.id, name: p.name, price: p.price, unit: p.unit, qty: 1, prep }];
    });
    setJustAddedId(p.id);
    setBasketWiggling(true);
    setTimeout(() => setJustAddedId(null), 1200);
    setTimeout(() => setBasketWiggling(false), 500);
  }

  function removeFromCart(id: string, prep?: string) {
    setCart(prev => prev.filter(i => !(i.id === id && (!prep || i.prep === prep))));
  }

  function updateCartQty(id: string, prep: string | undefined, delta: number) {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.id === id && (!prep || i.prep === prep)) {
            const nextQty = i.qty + delta;
            return nextQty > 0 ? { ...i, qty: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  }

  function updateCartPrep(id: string, oldPrep: string | undefined, newPrep: string) {
    setCart(prev => {
      return prev.map(i => {
        if (i.id === id && i.prep === oldPrep) {
          return { ...i, prep: newPrep };
        }
        return i;
      });
    });
  }

  // Spotlit star catch (e.g. Bangus or Prawns)
  const spotlightProduct = products.find(p => p.name.toLowerCase().includes("hipon") || p.name.toLowerCase().includes("prawn")) || products[0];

  return (
    <div className="flex flex-col h-full bg-[#FAF8F5] relative">
      {/* Primary Storefront Navigation */}
      <nav className="border-b border-[#E5DFD5] px-4 md:px-8 py-3.5 shrink-0 sticky top-0 z-40 bg-white">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <BrandLogo />

          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-[color:var(--brand-ink)]">
            <span className="text-[color:var(--coral)] font-bold border-b-2 border-[color:var(--coral)] pb-0.5">
              Today&apos;s Catches
            </span>
            {(["about", "track", "contact"] as View[]).map((v, i) => (
              <span
                key={v}
                onClick={() => onNavigate(v)}
                className="text-gray-600 hover:text-[color:var(--primary)] cursor-pointer transition-colors"
              >
                {["About the Shop", "Track Order", "Contact Us"][i]}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <IcSearch size={14} className="text-gray-500" />
              <span className="hidden sm:inline">Search Catch</span>
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden rounded-[var(--radius-sm)] border border-gray-200 p-2 text-gray-700 cursor-pointer"
            >
              <IcMenu size={16} />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className={`flex items-center gap-2 bg-[color:var(--coral)] text-white rounded-[var(--radius-sm)] px-4 py-2 text-xs font-bold hover:bg-[color:var(--coral-hover)] active:scale-95 transition-all cursor-pointer shadow-xs ${
                basketWiggling ? "anim-basket-wiggle" : ""
              }`}
            >
              <IcCart size={15} />
              <span>Catch Basket</span>
              {cartCount > 0 && (
                <span className="bg-white text-[color:var(--coral)] text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 mt-3 pt-3 flex flex-col gap-2 text-sm font-semibold text-[color:var(--brand-ink)]">
            <span className="text-[color:var(--coral)] py-1">Today&apos;s Catches</span>
            {(["about", "track", "contact"] as View[]).map((v, i) => (
              <span
                key={v}
                onClick={() => { onNavigate(v); setMenuOpen(false); }}
                className="py-1 cursor-pointer text-gray-600 hover:text-[color:var(--primary)]"
              >
                {["About the Shop", "Track Order", "Contact Us"][i]}
              </span>
            ))}
          </div>
        )}
      </nav>

      {/* Expandable search bar */}
      {searchOpen && (
        <div className="bg-[#F4EFEB] border-b border-[#E5DFD5] px-4 md:px-8 py-3.5 shrink-0 z-30">
          <div className="max-w-2xl mx-auto">
            <FieldInput
              placeholder="Search seafood by name (e.g. Bangus, Hipon, Squid, Alimango)..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto z-10">
        {/* Maritime Purveyor Hero Section */}
        <section className="bg-[#0B1E24] text-white py-14 md:py-20 px-4 md:px-8 border-b border-[#1A3842]">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Narrative Column */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-xs font-medium text-cyan-200 mb-6 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>Cavite Fish Port Dawn Catch · Direct to Dasmariñas City</span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] text-white mb-6">
                Fresh Seafood from Cavite Pier to Your Door.
              </h1>

              <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-xl font-normal">
                Sourced at dawn, cleaned and portioned to your preference, and delivered on crushed sea ice across Dasmariñas City before lunch.
              </p>

              {/* Concrete Logistics Strip */}
              <div className="grid grid-cols-3 gap-4 py-4 px-5 rounded-lg bg-white/5 border border-white/10 mb-8 max-w-lg">
                <div>
                  <div className="text-[11px] text-cyan-200/70 uppercase tracking-wider font-semibold">Morning Dock</div>
                  <div className="text-sm font-semibold text-white mt-0.5">5:30 AM Daily</div>
                </div>
                <div>
                  <div className="text-[11px] text-cyan-200/70 uppercase tracking-wider font-semibold">Cleaning</div>
                  <div className="text-sm font-semibold text-white mt-0.5">Free Scaling &amp; Gutting</div>
                </div>
                <div>
                  <div className="text-[11px] text-cyan-200/70 uppercase tracking-wider font-semibold">Cold Chain</div>
                  <div className="text-sm font-semibold text-white mt-0.5">Crushed Sea Ice</div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Btn
                  label="Browse Available Catches ↓"
                  filled
                  className="interactive-press"
                  onClick={() => {
                    const el = document.getElementById("catalog-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                />
                <Btn
                  label="Track Existing Order"
                  outline
                  className="interactive-press"
                  onClick={() => onNavigate("track")}
                />
              </div>
            </div>

            {/* Right: Featured Morning Catch Card */}
            {spotlightProduct && (
              <div className="w-full lg:w-96 shrink-0">
                <div className="bg-white text-[color:var(--brand-ink)] p-5 rounded-lg border border-[#E5DFD5] shadow-xl relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      Morning Highlight
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      Port Weighed
                    </span>
                  </div>

                  {/* Image Frame */}
                  <div className="w-full aspect-[16/10] rounded overflow-hidden mb-4 bg-gray-50 border border-gray-100">
                    <ProductImage name={spotlightProduct.name} />
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-[color:var(--brand-ink)] leading-snug">
                      {spotlightProduct.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Includes complimentary scaling, gutting, or steak slicing.
                    </p>

                    <div className="flex items-baseline justify-between mt-4 pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-[11px] text-gray-500 block">Price per Unit</span>
                        <span className="font-mono text-2xl font-bold text-[color:var(--coral)]">
                          ₱{spotlightProduct.price}
                        </span>
                        <span className="text-xs text-gray-500 ml-1 font-mono">{spotlightProduct.unit}</span>
                      </div>
                      <Btn
                        label={justAddedId === spotlightProduct.id ? "Added to Basket" : "Add to Basket"}
                        filled
                        className={justAddedId === spotlightProduct.id ? "bg-emerald-600 text-white shadow-xs" : "interactive-press"}
                        onClick={() => addToCart(spotlightProduct, "Cleaned & Scaled")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Catalog Section */}
        <section id="catalog-section" className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display font-black text-2xl md:text-3xl text-[color:var(--brand-ink)] tracking-tight">
                Today&apos;s Available Catches
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Real-time inventory from today&apos;s morning market. Weighed raw, cleaned free, and dispatched cold.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categoryNames.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === c
                      ? "bg-[color:var(--coral)] text-white shadow-xs"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Culinary Recipe / Dish Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 text-xs font-medium">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
              Cook For:
            </span>
            {[
              { label: "All Catches", tag: "all" },
              { label: "Sinigang Catch", tag: "sinigang" },
              { label: "Inihaw / Grill", tag: "inihaw" },
              { label: "Ginataan Special", tag: "ginataan" },
              { label: "Kilawin Fresh", tag: "kilawin" },
            ].map(f => (
              <button
                key={f.tag}
                onClick={() => setCookingFilter(f.tag)}
                className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                  cookingFilter === f.tag
                    ? "bg-[#1F7A8C] text-white border-[#1F7A8C] shadow-xs"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="market-card py-16 text-center flex flex-col items-center justify-center gap-3 bg-white">
              <div className="text-[color:var(--coral)] opacity-70">
                <IcFish size={44} />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {query ? `No catch found matching "${search.trim()}".` : "No products available under this cooking filter today."}
              </p>
              <button
                onClick={() => { setSearch(""); setCookingFilter("all"); setActiveCategory("All"); }}
                className="text-xs font-bold text-[color:var(--coral)] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Products Grid */}
          <div key={`${activeCategory}-${cookingFilter}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 anim-grid-fade">
            {filtered.map(p => (
              <div key={p.id} className="market-card bg-white overflow-hidden flex flex-col group">
                <div className="w-full aspect-[4/3] relative overflow-hidden bg-gray-50 border-b border-gray-100">
                  <ProductImage name={p.name} />
                  <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/95 px-2 py-0.5 rounded text-gray-700 border border-gray-200">
                      {p.category}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    {p.status === "In Stock" && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                        In Stock
                      </span>
                    )}
                    {p.status === "Low Stock" && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                        Low Stock
                      </span>
                    )}
                    {p.status === "Out of Stock" && (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] font-semibold border border-rose-200">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h3 className="text-sm font-bold text-[color:var(--brand-ink)] group-hover:text-[color:var(--coral)] transition-colors line-clamp-1">
                    {p.name}
                  </h3>

                  <p className="text-xs text-gray-500">
                    Complimentary cleaning &amp; scaling
                  </p>

                  <div className="flex items-baseline justify-between mt-auto pt-3 border-t border-gray-100">
                    <div>
                      <span className="font-mono text-xl font-bold text-[color:var(--coral)]">
                        ₱{p.price}
                      </span>
                      <span className="text-xs text-gray-500 font-mono ml-1">
                        {p.unit}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{p.stock} units</span>
                  </div>

                  <div className="mt-1">
                    <Btn
                      label={
                        p.status === "Out of Stock"
                          ? "Out of Stock"
                          : justAddedId === p.id
                          ? "Added to Basket"
                          : "Add to Basket"
                      }
                      filled={p.status !== "Out of Stock"}
                      disabled={p.status === "Out of Stock"}
                      small
                      full
                      className={
                        justAddedId === p.id
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "interactive-press"
                      }
                      onClick={() => addToCart(p, "Cleaned & Scaled")}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quality Standards Section */}
          <div className="mt-16 pt-12 border-t border-[#E5DFD5]">
            <h3 className="font-display font-black text-xl text-[color:var(--brand-ink)] text-center mb-8">
              The Hook &amp; Box Freshness Guarantee
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <IcFish size={22} />, title: "Daily Morning Wet Catch", desc: "Never frozen stock. Sourced at dawn from Cavite fish ports and packed immediately on crushed sea ice." },
                { icon: <IcBox size={22} />, title: "Free Cleaning & Preparation", desc: "Tell us how you want it: scaled, gutted, sliced into steaks, or kept whole fresh — prepared with strict kitchen hygiene." },
                { icon: <IcTruck size={22} />, title: "Insulated Same-Day Delivery", desc: "Dispatched via sealed cold-chain boxes directly to your doorstep in Dasmariñas City before lunch." },
              ].map(feat => (
                <div key={feat.title} className="market-card bg-white p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-orange-50 text-[color:var(--coral)] flex items-center justify-center shrink-0 border border-orange-100">
                    {feat.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[color:var(--brand-ink)]">{feat.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#0B1E24] text-white border-t border-gray-800 mt-16 py-12 px-4 md:px-8 text-xs text-gray-400">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <BrandLogo size="md" />
              <p className="mt-2 text-gray-400">Fresh Wet-Market Seafood Purveyor · Dasmariñas City, Cavite</p>
            </div>
            <p className="text-center text-gray-400">Academic Capstone Project (SIA) · Fictional Seafood Retailer</p>
            <div className="flex gap-5">
              <span onClick={() => onNavigate("about")} className="hover:text-[color:var(--coral)] cursor-pointer">About the Shop</span>
              <span onClick={() => onNavigate("track")} className="hover:text-[color:var(--coral)] cursor-pointer">Track Order</span>
              <span onClick={() => onNavigate("contact")} className="hover:text-[color:var(--coral)] cursor-pointer">Contact Us</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Sticky Quick-Cart Bar */}
      {cartCount > 0 && !cartOpen && (
        <div className="md:hidden fixed bottom-4 inset-x-4 z-40">
          <div className="p-3.5 bg-white rounded-lg border border-orange-200 shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[color:var(--brand-ink)]">
                {cartCount} item{cartCount > 1 ? "s" : ""} in Basket
              </div>
              <div className="text-sm font-mono font-bold text-[color:var(--coral)]">
                ₱{cartTotal}
              </div>
            </div>
            <Btn
              label="View Basket →"
              filled
              small
              className="interactive-press"
              onClick={() => setCartOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Catch Basket Slide-over */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 anim-backdrop-fade" onClick={() => setCartOpen(false)}>
          <div
            className="w-full max-w-lg h-full bg-[#FAF8F5] flex flex-col shadow-2xl z-10 border-l border-[#E5DFD5] overflow-hidden anim-drawer-slide"
            onClick={e => e.stopPropagation()}
          >
            {/* 1. Header */}
            <div className="px-6 py-4 bg-[#0E2931] text-white flex items-center justify-between shadow-xs shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[color:var(--coral)] border border-white/10">
                  <IcCart size={16} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white tracking-tight">Your Catch Basket</h3>
                  <p className="text-xs text-gray-300">
                    {cartCount} item{cartCount === 1 ? "" : "s"} selected
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-all"
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {/* 2. Free Delivery Notice */}
            <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200/80 text-xs flex items-center justify-between shrink-0">
              {cartTotal >= 500 ? (
                <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                  Free cold-chain delivery unlocked for Dasmariñas
                </span>
              ) : (
                <span className="text-amber-900 font-medium">
                  Add <strong>₱{500 - cartTotal}</strong> more for free cold delivery
                </span>
              )}
              <span className="text-xs font-mono text-gray-500">{cartTotal}/₱500</span>
            </div>

            {/* 3. Basket Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center gap-3 my-auto">
                  <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-[color:var(--coral)]">
                    <IcFish size={28} />
                  </div>
                  <h4 className="font-display font-bold text-base text-[color:var(--brand-ink)]">Your basket is empty</h4>
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                    Fresh catches dock at Cavite port every dawn. Choose from our fresh selection for today.
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-2 text-xs font-semibold text-[color:var(--coral)] hover:underline cursor-pointer"
                  >
                    Browse Available Catches →
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="flex flex-col gap-3">
                    {cart.map(item => (
                      <div
                        key={`${item.id}-${item.prep}`}
                        className="p-3.5 rounded-md border border-[#E5DFD5] bg-white shadow-2xs flex flex-col gap-2.5"
                      >
                        <div className="flex gap-3 items-start">
                          <div className="w-16 h-16 rounded overflow-hidden shrink-0 border border-gray-200 bg-gray-50">
                            <ProductImage name={item.name} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <h4 className="text-sm font-bold text-[color:var(--brand-ink)] leading-snug line-clamp-1">
                                  {item.name}
                                </h4>
                                <span className="text-xs font-mono text-gray-500 block mt-0.5">
                                  ₱{item.price} {item.unit}
                                </span>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id, item.prep)}
                                className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                title="Remove item"
                                aria-label={`Remove ${item.name}`}
                              >
                                <IcTrash size={15} />
                              </button>
                            </div>

                            {/* Prep Selector */}
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-gray-500 font-semibold">Prep:</span>
                              {["Cleaned & Scaled", "Whole Fresh", "Sliced Steaks"].map(prepOption => (
                                <button
                                  key={prepOption}
                                  onClick={() => updateCartPrep(item.id, item.prep, prepOption)}
                                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                    item.prep === prepOption
                                      ? "bg-amber-100 text-amber-900 border-amber-300 font-semibold"
                                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  {prepOption}
                                </button>
                              ))}
                            </div>

                            {/* Stepper & Line Total */}
                            <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                              <div className="inline-flex items-center rounded border border-gray-200 bg-gray-50 overflow-hidden">
                                <button
                                  onClick={() => updateCartQty(item.id, item.prep, -1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                                  aria-label="Decrease quantity"
                                >
                                  <IcMinus size={11} />
                                </button>
                                <span className="w-8 text-center text-xs font-mono font-bold text-[color:var(--brand-ink)] select-none">
                                  {item.qty}
                                </span>
                                <button
                                  onClick={() => updateCartQty(item.id, item.prep, 1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                                  aria-label="Increase quantity"
                                >
                                  <IcPlus size={11} />
                                </button>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] text-gray-400 block uppercase">Line Total</span>
                                <span className="text-sm font-mono font-bold text-[color:var(--coral)]">
                                  ₱{item.price * item.qty}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cold-Lock Packaging Info */}
                  <div className="p-3.5 rounded-md bg-[#F0F8FA] border border-[#CDE5EC] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-[color:var(--primary)] flex items-center justify-center shrink-0 border border-cyan-200">
                      <IcSnowflake size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[color:var(--primary)]">Insulated Cold-Box Packaging Included</h5>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                        Sealed with crushed sea ice in a food-grade box to ensure peak freshness to Dasmariñas City.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 4. Checkout Summary Footer */}
            <div className="p-6 border-t border-[#E5DFD5] bg-white flex flex-col gap-2.5 shadow-lg shrink-0">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Catch Subtotal</span>
                <span className="font-mono font-semibold text-gray-900">₱{cartTotal}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Linis &amp; Kaliskis (Cleaning Service)</span>
                <span className="text-emerald-700 font-semibold">Included</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Insulated Sea-Ice Box</span>
                <span className="text-emerald-700 font-semibold">Included</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Dasmariñas Courier</span>
                <span className="font-mono">{deliveryFee === 0 ? <span className="text-emerald-700 font-semibold">Free</span> : `₱${deliveryFee}`}</span>
              </div>

              <div className="flex items-baseline justify-between pt-2.5 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-900">Total Payable</span>
                <span className="font-mono text-2xl font-bold text-[color:var(--coral)]">₱{cartTotal + deliveryFee}</span>
              </div>

              {cart.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5">
                  <Btn
                    label={`Proceed to Checkout · ₱${cartTotal + deliveryFee} →`}
                    filled
                    full
                    onClick={() => {
                      setCartOpen(false);
                      onCheckout(cart);
                    }}
                  />
                  <p className="text-[11px] text-gray-500 text-center">
                    Cash on Delivery (COD) or GCash confirmed upon delivery
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin View ───────────────────────────────────────────────────────────────

function AdminView({
  products, onLock,
}: {
  products: Product[];
  onLock: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "orders" | "ledger">("dashboard");
  const [inventory, setInventory] = useState<Product[]>(products);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState("");
  const [invSearch, setInvSearch] = useState("");
  const [invCategory, setInvCategory] = useState("All");
  const [invStatus, setInvStatus] = useState<"All" | "In Stock" | "Low Stock" | "Out of Stock">("All");
  const [addOpen, setAddOpen] = useState(false);

  function saveStock(id: string) {
    const val = parseInt(editStock, 10);
    if (!isNaN(val)) {
      setInventory(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, stock: val, status: val === 0 ? "Out of Stock" : val <= 10 ? "Low Stock" : "In Stock" }
            : p
        )
      );
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
    { key: "ledger" as const, icon: <IcClock size={15} />, label: "Stock Ledger" },
  ];

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#FAF8F5]">
      {/* Mobile tab bar */}
      <div className="md:hidden flex bg-[#0F242A] shrink-0 overflow-x-auto border-b border-gray-800">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-3 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === t.key ? "bg-[color:var(--coral)] text-white" : "text-gray-300 hover:text-white"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-[#0F242A] text-white flex-col shrink-0 border-r border-[#1B363F]">
        <div className="p-5 border-b border-white/10">
          <BrandLogo size="md" />
          <p className="text-xs text-gray-400 mt-2 font-medium">Staff Operations Portal</p>
        </div>
        <nav className="flex flex-col py-3 gap-1 flex-1 px-3">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`text-left px-3.5 py-2.5 rounded-[var(--radius-sm)] text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === t.key ? "bg-[color:var(--coral)] text-white shadow-xs" : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-2">Role: Administrator</p>
          <button
            onClick={onLock}
            className="w-full text-xs font-semibold border border-white/20 text-gray-200 hover:bg-white/10 hover:text-white py-2 rounded-[var(--radius-sm)] transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Surface */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === "dashboard" && (
            <>
              <div className="mb-6">
                <h2 className="font-display font-bold text-2xl md:text-3xl text-[color:var(--brand-ink)] tracking-tight">
                  Overview Dashboard
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Real-time seafood catalog and operational stats</p>
              </div>

              {lowItems.length > 0 && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-[var(--radius-sm)] p-4 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs text-amber-900 font-medium flex items-center gap-2">
                    <IcWarning size={16} className="text-amber-600 shrink-0" />
                    <span>{lowItems.length} product{lowItems.length > 1 ? "s" : ""} require attention: {lowItems.map(i => i.name).join(", ")}</span>
                  </p>
                  <button
                    onClick={() => setActiveTab("inventory")}
                    className="text-xs font-bold text-amber-900 underline cursor-pointer"
                  >
                    View in Inventory →
                  </button>
                </div>
              )}

              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Today's Orders", val: "24", sub: "Sep 1, 2026", icon: <IcDoc size={18} className="text-[color:var(--coral)]" /> },
                  { label: "Today's Revenue", val: "₱12,480", sub: "+8% vs yesterday", icon: <IcPeso size={18} className="text-[color:var(--primary)]" /> },
                  { label: "Stock Alerts", val: String(lowItems.length), sub: "Low / out of stock", icon: <IcWarning size={18} className="text-amber-500" /> },
                  { label: "Pending Orders", val: String(pending), sub: "Requires confirmation", icon: <IcClock size={18} className="text-[#134F5C]" /> },
                ].map(card => (
                  <div key={card.label} className="market-card p-5 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</span>
                      {card.icon}
                    </div>
                    <p className="font-mono font-bold text-2xl mt-3 text-[color:var(--brand-ink)]">{card.val}</p>
                    <span className="text-xs text-gray-500 mt-1 block">{card.sub}</span>
                  </div>
                ))}
              </div>

              {/* Hand-built charts */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="p-5 bg-white">
                  <Label>Weekly Sales Volume (kg)</Label>
                  <div className="flex items-end gap-2 mt-4 h-32 border-b border-gray-200 pb-0">
                    {[40, 65, 55, 80, 90, 70, 48].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div className="w-full bg-[color:var(--primary)] rounded-t-[var(--radius-xs)] transition-all hover:bg-[color:var(--coral)]" style={{ height: `${h}%` }} />
                        <span className="text-[10px] font-mono text-gray-500">{["M","T","W","T","F","S","S"][i]}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5 bg-white">
                  <Label>Top Selling Catches</Label>
                  <div className="flex flex-col gap-3 mt-4">
                    {[
                      { name: "Bangus (Milkfish)", pct: 85 },
                      { name: "Hipon (Prawns)", pct: 72 },
                      { name: "Alimango (Crabs)", pct: 60 },
                      { name: "Pusit (Squid)", pct: 48 },
                    ].map(item => (
                      <div key={item.name} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-700 w-32 truncate">{item.name}</span>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[color:var(--coral)] rounded-full" style={{ width: `${item.pct}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 w-8 text-right">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Recent Orders Overview */}
              <Card className="p-5 bg-white">
                <Label>Recent Customer Orders</Label>
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-200 text-left font-mono text-[11px] text-gray-500 uppercase tracking-wider">
                        <th className="pb-2 pr-4">Order ID</th>
                        <th className="pb-2 pr-4">Customer</th>
                        <th className="pb-2 pr-4">Total</th>
                        <th className="pb-2 pr-4">Payment</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ORDERS.map(o => (
                        <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">
                          <td className="py-2.5 pr-4 font-mono font-semibold text-[color:var(--primary)] text-xs">{o.id}</td>
                          <td className="py-2.5 pr-4 text-xs font-medium text-[color:var(--brand-ink)]">{o.customer}</td>
                          <td className="py-2.5 pr-4 text-xs font-mono font-bold text-[color:var(--coral)]">₱{o.total}</td>
                          <td className="py-2.5 pr-4"><Tag label={o.payment} color="muted" /></td>
                          <td className="py-2.5"><Tag label={o.status} color={o.status === "Delivered" ? "muted" : "coral"} /></td>
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
                <div>
                  <h2 className="font-display font-bold text-2xl md:text-3xl text-[color:var(--brand-ink)] tracking-tight">
                    Inventory Catalog
                  </h2>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">Manage live seafood inventory levels</p>
                </div>
                <Btn label="+ Add Product" filled small onClick={() => setAddOpen(true)} />
              </div>

              {/* Search & filters */}
              <div className="flex gap-3 mb-4 flex-wrap items-center">
                <div className="flex-1 min-w-[180px]">
                  <FieldInput placeholder="Search inventory…" value={invSearch} onChange={setInvSearch} />
                </div>
                <div className="relative">
                  <select
                    value={invCategory}
                    onChange={e => setInvCategory(e.target.value)}
                    className="appearance-none border border-gray-200 rounded-[var(--radius-sm)] pl-3 pr-8 py-2 text-xs font-mono text-gray-700 bg-white outline-none focus:border-[color:var(--coral)] cursor-pointer"
                  >
                    {invCategories.map(c => (
                      <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap items-center">
                <div className="inline-flex border border-gray-200 rounded-[var(--radius-sm)] overflow-hidden bg-white">
                  {([
                    { key: "All", label: "All" },
                    { key: "In Stock", label: "In Stock" },
                    { key: "Low Stock", label: "Low" },
                    { key: "Out of Stock", label: "Out" },
                  ] as const).map(s => (
                    <button
                      key={s.key}
                      onClick={() => setInvStatus(s.key)}
                      className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer ${
                        invStatus === s.key ? "bg-[color:var(--coral)] text-white" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono text-gray-500 ml-1">
                  Showing {filteredInventory.length} of {inventory.length}
                </span>
                {filtersActive && (
                  <button
                    onClick={() => { setInvSearch(""); setInvCategory("All"); setInvStatus("All"); }}
                    className="text-xs font-mono font-bold text-[color:var(--coral)] hover:underline ml-auto cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <Card className="overflow-x-auto bg-white">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80 text-left font-mono text-[11px] text-gray-600 uppercase tracking-wider">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Unit</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-xs font-mono text-gray-500">
                          No items match the active filters.
                        </td>
                      </tr>
                    )}
                    {filteredInventory.map((p, idx) => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm font-bold text-[color:var(--brand-ink)]">{p.name}</td>
                        <td className="px-4 py-3"><Tag label={p.category} color="cyan" /></td>
                        <td className="px-4 py-3 text-xs font-mono font-bold text-[color:var(--brand-ink)]">₱{p.price}</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{p.unit}</td>
                        <td className="px-4 py-3">
                          {editingId === p.id ? (
                            <div className="flex gap-1.5 items-center">
                              <input
                                autoFocus
                                value={editStock}
                                onChange={e => setEditStock(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && saveStock(p.id)}
                                className="border border-gray-300 rounded-[var(--radius-xs)] px-2 py-1 text-xs font-mono w-16 outline-none focus:border-[color:var(--coral)]"
                              />
                              <Btn label="Save" filled small onClick={() => saveStock(p.id)} />
                            </div>
                          ) : (
                            <span className="text-xs font-mono font-bold text-[color:var(--brand-ink)]">{p.stock}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Tag
                            label={p.status}
                            color={p.status === "In Stock" ? "cyan" : p.status === "Low Stock" ? "warning" : "rose"}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setEditingId(p.id); setEditStock(String(p.stock)); }}
                            className="text-xs text-[color:var(--primary)] hover:underline font-mono font-bold cursor-pointer"
                          >
                            Adjust Stock
                          </button>
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
                <div>
                  <h2 className="font-display font-bold text-2xl md:text-3xl text-[color:var(--brand-ink)] tracking-tight">
                    Customer Orders
                  </h2>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">Track fulfillment and courier status</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {ORDERS.map(o => (
                  <Card key={o.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-[color:var(--primary)]">{o.id}</span>
                        <Tag label={o.status} color={o.status === "Delivered" ? "muted" : "coral"} />
                        <Tag label={o.payment} color="muted" />
                        <Tag label="Lalamove" color="cyan" />
                      </div>
                      <p className="text-sm font-bold text-[color:var(--brand-ink)]">{o.customer}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{o.items}</p>
                      <p className="text-[11px] font-mono text-gray-400 mt-1">{o.date}</p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                      <p className="font-mono font-bold text-lg text-[color:var(--coral)]">₱{o.total}</p>
                      <div className="flex gap-2">
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

// ─── Stock Movement Ledger (Academic Demo Centerpiece) ─────────────────────────

function StockLedger() {
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
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-[color:var(--brand-ink)] tracking-tight">
          Stock Movement Ledger
        </h2>
        <p className="text-xs text-gray-500 font-mono mt-0.5">
          Append-only audit trail. Movements are immutable; corrections are compensating rows.
        </p>
      </div>

      {/* 4 Summary metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="market-card p-4 bg-white">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Movements</p>
          <p className="font-mono font-bold text-2xl text-[color:var(--brand-ink)] mt-2">{rows.length}</p>
        </div>
        <div className="market-card p-4 bg-white">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Received</p>
          <p className="font-mono font-bold text-2xl text-[color:var(--primary)] mt-2">+{totalIn}</p>
        </div>
        <div className="market-card p-4 bg-white">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Outflow</p>
          <p className="font-mono font-bold text-2xl text-[color:var(--coral)] mt-2">{totalOut}</p>
        </div>
        <div className="market-card p-4 bg-white">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">On Hand Total</p>
          <p className="font-mono font-bold text-2xl text-[color:var(--brand-ink)] mt-2">{balance}</p>
        </div>
      </div>

      {/* Full-width audit table */}
      <div className="market-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#0E2931] text-white text-left text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Ref ID</th>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Seafood Item &amp; SKU</th>
                <th className="px-4 py-3 font-semibold">Movement Reason</th>
                <th className="px-4 py-3 font-semibold text-right">Quantity</th>
                <th className="px-4 py-3 font-semibold text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-t border-gray-100 transition-colors hover:bg-orange-50/40 ${
                    i === rows.length - 1
                      ? "bg-emerald-50/60 font-semibold"
                      : r.reason.includes("Correction")
                      ? "bg-amber-50/60"
                      : i % 2 ? "bg-gray-50/50" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[color:var(--primary)] whitespace-nowrap">
                    {r.id}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {r.at}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-xs text-[color:var(--brand-ink)]">{r.item}</p>
                    <p className="font-mono text-[10px] text-gray-400">{r.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {r.reason}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-bold text-xs whitespace-nowrap ${
                    r.qty < 0 ? "text-[color:var(--coral)]" : "text-[color:var(--primary)]"
                  }`}>
                    {r.qty > 0 ? `+${r.qty}` : r.qty}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-xs text-[color:var(--brand-ink)] whitespace-nowrap">
                    {r.balance}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-mono text-xs font-bold text-[color:var(--brand-ink)]">
                <td colSpan={4} className="px-4 py-3 text-right uppercase tracking-wider">
                  Total Ledger Balance:
                </td>
                <td className="px-4 py-3 text-right text-gray-500">
                  <span className="text-[color:var(--primary)]">+{totalIn}</span> / <span className="text-[color:var(--coral)]">{totalOut}</span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-sm text-[color:var(--brand-ink)]">
                  {balance}
                </td>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onClick={onClose}>
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-[var(--radius-md)] border border-gray-200 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-[#134F5C] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-display font-bold text-lg">Add New Seafood Product</h3>
            <p className="text-xs text-cyan-100">Set product info and individual cut/weight variants</p>
          </div>
          <button onClick={onClose} className="text-cyan-200 hover:text-white p-1 cursor-pointer" aria-label="Close">
            <IcXCircle size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex flex-col gap-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-[var(--radius-xs)] bg-[color:var(--coral)] text-white text-[11px] font-mono font-bold flex items-center justify-center">1</span>
              <Label>Product Details</Label>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">Product Name *</label>
                <FieldInput placeholder="e.g. Galunggong (Round Scad)" value={name} onChange={setName} />
              </div>
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">Category *</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-mono text-gray-700 bg-white outline-none focus:border-[color:var(--coral)] cursor-pointer"
                  >
                    {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Short description visible to customers…"
                  className="w-full border border-gray-200 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-white outline-none focus:border-[color:var(--coral)] resize-none"
                />
              </div>
            </div>
          </section>

          <Divider />

          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-[var(--radius-xs)] bg-[color:var(--coral)] text-white text-[11px] font-mono font-bold flex items-center justify-center">2</span>
                <Label>Variants (Price &amp; Stock live here)</Label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {variants.map((v, idx) => {
                const suggestedSku = suggestSku(v.name);
                return (
                  <div key={idx} className="border border-gray-200 rounded-[var(--radius-sm)] p-4 bg-gray-50/70">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-mono font-bold text-gray-700">Variant {idx + 1}</p>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="text-xs text-rose-600 font-mono hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-xs font-semibold text-gray-600">Variant Name *</label>
                        <FieldInput placeholder="e.g. 500g, Whole 1kg" value={v.name} onChange={val => updateVariant(idx, { name: val })} />
                      </div>
                      <div>
                        <label className="block mb-1 text-xs font-semibold text-gray-600">SKU *</label>
                        <FieldInput placeholder={suggestedSku} value={v.sku} onChange={val => updateVariant(idx, { sku: val })} />
                        <button
                          type="button"
                          onClick={() => updateVariant(idx, { sku: suggestedSku })}
                          className="text-[11px] text-[color:var(--primary)] hover:underline mt-1 font-mono cursor-pointer"
                        >
                          Auto-suggest SKU
                        </button>
                      </div>
                      <div>
                        <label className="block mb-1 text-xs font-semibold text-gray-600">Price (₱) *</label>
                        <FieldInput type="number" placeholder="0" value={v.price} onChange={val => updateVariant(idx, { price: val })} />
                      </div>
                      <div>
                        <label className="block mb-1 text-xs font-semibold text-gray-600">Initial Stock</label>
                        <FieldInput type="number" placeholder="0" value={v.stock} onChange={val => updateVariant(idx, { stock: val })} />
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addVariant}
                className="w-full border border-dashed border-gray-300 rounded-[var(--radius-sm)] py-2.5 text-xs font-mono font-bold uppercase text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                + Add Another Variant
              </button>
            </div>
          </section>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50">
          <Btn label="Cancel" onClick={onClose} />
          <Btn label="Save Product" filled onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

// ─── Multi-step Checkout View ─────────────────────────────────────────────────

type Assurance = { icon: React.ReactNode; label: string; copy: string };
function CheckoutNotes({ items }: { items: Assurance[] }) {
  return (
    <div className="border-t border-gray-200 pt-5 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map(it => (
        <div key={it.label} className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-[var(--radius-sm)] bg-orange-100 text-[color:var(--coral)] flex items-center justify-center shrink-0">
            {it.icon}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[color:var(--brand-ink)] leading-tight">{it.label}</p>
            <p className="text-[11px] text-gray-600 leading-snug mt-0.5">{it.copy}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentView({
  cart, onBack, onTrack,
}: {
  cart: CartItem[]; onBack: () => void; onTrack: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [method, setMethod] = useState<"GCash" | "COD" | "">("");
  const [payError, setPayError] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + deliveryFee;

  const STEP_LABELS = ["Review", "Delivery", "Payment", "Confirmed"];

  const STEP_NOTES: Record<1 | 2 | 3 | 4, Assurance[]> = {
    1: [
      { icon: <IcFish size={16} />, label: "Fresh Daily Catch", copy: "Sourced each morning directly from the wet market." },
      { icon: <IcClock size={16} />, label: "Variant Pricing", copy: "Each cut and size is weighed and priced separately." },
      { icon: <IcCheckCircle size={16} />, label: "Transparent Weight", copy: "The final total displayed is what you pay upon receipt." },
    ],
    2: [
      { icon: <IcTruck size={16} />, label: "Dasma Coverage", copy: "Delivered throughout Dasmariñas City and border barangays." },
      { icon: <IcClock size={16} />, label: "Morning Slots", copy: "Select morning delivery to receive peak freshness." },
      { icon: <IcFish size={16} />, label: "Cold-Chain Sealed", copy: "Sealed in insulated ice containers during transit." },
    ],
    3: [
      { icon: <IcCard size={16} />, label: "Order Verification", copy: "We confirm your GCash or COD choice before dispatch." },
      { icon: <IcCheckCircle size={16} />, label: "No Prepayment Required", copy: "Orders remain Pending until confirmed." },
      { icon: <IcPhone size={16} />, label: "Direct Support", copy: "Direct shop line available for order instructions." },
    ],
    4: [
      { icon: <IcDoc size={16} />, label: "Order Pending", copy: "Your order is queued in our system for preparation." },
      { icon: <IcFish size={16} />, label: "Ice Packing", copy: "Staff weighs and packs catch upon confirmation." },
      { icon: <IcTruck size={16} />, label: "Live Tracking", copy: "Use your Order ID to monitor delivery stages." },
    ],
  };

  return (
    <div className="h-full bg-[#FAF8F5] overflow-y-auto relative">
      {/* Top Header */}
      <div className="border-b border-[#E5DFD5] px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-[color:var(--coral)] text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            ← Return to Market
          </button>
          <BrandLogo size="sm" />
        </div>
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Checkout</span>
      </div>

      {/* Step Indicators */}
      <div className="border-b border-[#E5DFD5] bg-white py-4 px-4 overflow-x-auto relative z-10">
        <div className="flex items-center justify-center gap-2 max-w-xl mx-auto">
          {STEP_LABELS.map((label, idx) => {
            const n = idx + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={n} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      done
                        ? "bg-emerald-600 text-white"
                        : active
                        ? "bg-[color:var(--coral)] text-white shadow-xs"
                        : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}
                  >
                    {done ? "✓" : n}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      active ? "text-[color:var(--brand-ink)]" : done ? "text-emerald-700" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {idx < 3 && <div className="w-6 sm:w-10 h-0.5 bg-gray-200 mx-2" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 70/30 Natural Height Layout Container */}
      <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col md:flex-row gap-6 md:items-start relative z-10">
        {/* 70% Main Flow Column */}
        <div className="w-full md:basis-[70%] md:min-w-0 flex flex-col gap-4">
          {step === 1 && (
            <div className="market-card overflow-hidden bg-white">
              <div className="bg-[#0E2931] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="font-display font-bold text-base">Step 1 · Review Selected Catches</h3>
                <Tag label={`${cart.length} item${cart.length !== 1 ? "s" : ""}`} color="white" />
              </div>
              <div className="p-6 flex flex-col gap-3">
                {cart.map(item => (
                  <div key={`${item.id}-${item.prep}`} className="flex items-center gap-4 p-3 rounded-[var(--radius-sm)] border border-gray-200 bg-[#FAF8F5]">
                    <div className="w-12 h-12 rounded-[var(--radius-xs)] bg-white border border-gray-200 flex items-center justify-center text-[color:var(--primary)] shrink-0">
                      <IcFish size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[color:var(--brand-ink)] truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.prep}</p>
                      <p className="text-xs font-mono text-gray-600">₱{item.price} {item.unit} × {item.qty}</p>
                    </div>
                    <span className="font-mono font-bold text-sm text-[color:var(--coral)] shrink-0">
                      ₱{item.price * item.qty}
                    </span>
                  </div>
                ))}
                <div className="mt-3 flex justify-end">
                  <Btn label="Continue to Delivery →" filled onClick={() => setStep(2)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <Card className="overflow-hidden bg-white">
              <div className="bg-[#0E2931] text-white px-6 py-4">
                <h3 className="font-display font-bold text-base">Step 2 · Delivery Information</h3>
                <p className="text-xs text-gray-300">Dasmariñas City local courier delivery</p>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 bg-cyan-50/70 border border-cyan-200/80 rounded-[var(--radius-sm)] px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-[color:var(--primary)] text-white flex items-center justify-center shrink-0">
                    <IcTruck size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[color:var(--brand-ink)]">Dispatched via Lalamove</p>
                    <p className="text-[11px] text-gray-600">Packed with ice packs right before rider arrives.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>First Name</Label><div className="mt-1"><FieldInput placeholder="Maria" /></div></div>
                  <div><Label>Last Name</Label><div className="mt-1"><FieldInput placeholder="Santos" /></div></div>
                </div>
                <div><Label>Contact Phone Number</Label><div className="mt-1"><FieldInput placeholder="09XX XXX XXXX" /></div></div>
                <div><Label>Street Address / House No.</Label><div className="mt-1"><FieldInput placeholder="Block 5, Lot 12, Phase 2…" /></div></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>Barangay</Label><div className="mt-1"><FieldInput placeholder="Salawag" /></div></div>
                  <div><Label>City</Label><div className="mt-1"><FieldInput placeholder="Dasmariñas" /></div></div>
                </div>

                <div>
                  <Label>Preferred Morning Slot</Label>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {["6:00 – 8:00 AM", "8:00 – 10:00 AM", "10:00 – 12:00 PM"].map((t, i) => (
                      <button
                        key={t}
                        type="button"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] border transition-colors cursor-pointer ${
                          i === 0 ? "bg-[color:var(--coral)] text-white border-transparent" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <Btn label="← Back" onClick={() => setStep(1)} />
                  <Btn label="Continue to Payment →" filled onClick={() => setStep(3)} />
                </div>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="overflow-hidden bg-white">
              <div className="bg-[#0E2931] text-white px-6 py-4">
                <h3 className="font-display font-bold text-base">Step 3 · Payment Method</h3>
                <p className="text-xs text-gray-300">Select payment upon delivery or GCash transfer</p>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setMethod("GCash"); setPayError(false); }}
                    className={`p-4 rounded-[var(--radius-sm)] border text-left flex items-start gap-3 transition-all active:scale-[0.99] cursor-pointer ${
                      method === "GCash"
                        ? "border-[color:var(--coral)] ring-1 ring-[color:var(--coral)] bg-orange-50/50 shadow-2xs"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-[var(--radius-xs)] bg-orange-100 text-[color:var(--coral)] flex items-center justify-center shrink-0">
                      <IcGcash size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[color:var(--brand-ink)]">GCash Transfer</p>
                      <p className="text-xs text-gray-500 mt-0.5">Direct merchant mobile transfer</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMethod("COD"); setPayError(false); }}
                    className={`p-4 rounded-[var(--radius-sm)] border text-left flex items-start gap-3 transition-all active:scale-[0.99] cursor-pointer ${
                      method === "COD"
                        ? "border-[color:var(--coral)] ring-1 ring-[color:var(--coral)] bg-orange-50/50 shadow-2xs"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-[var(--radius-xs)] bg-orange-100 text-[color:var(--coral)] flex items-center justify-center shrink-0">
                      <IcCash size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[color:var(--brand-ink)]">Cash on Delivery (COD)</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pay courier rider in cash upon arrival</p>
                    </div>
                  </button>
                </div>

                {method === "GCash" && (
                  <div className="border border-gray-200 rounded-[var(--radius-sm)] p-4 bg-[#FAF8F5]">
                    <p className="text-xs font-bold text-[color:var(--brand-ink)] mb-2">GCash Transfer Instructions</p>
                    <div className="flex flex-col gap-1.5 text-xs text-gray-700">
                      <div className="flex justify-between py-1 border-b border-gray-200/60">
                        <span className="text-gray-500">Account Name</span>
                        <span className="font-semibold text-gray-800">Hook &amp; Box Seafood</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200/60">
                        <span className="text-gray-500">GCash Mobile</span>
                        <span className="font-mono font-semibold text-gray-800">0917-XXX-XXXX</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Exact Total</span>
                        <span className="font-mono font-bold text-[color:var(--coral)] text-sm">₱{total}</span>
                      </div>
                    </div>
                  </div>
                )}

                {method === "COD" && (
                  <div className="border border-gray-200 rounded-[var(--radius-sm)] p-4 bg-[#FAF8F5] text-xs text-gray-700">
                    Please prepare exact cash amount of <strong className="font-mono font-bold text-sm text-[color:var(--coral)]">₱{total}</strong> for the rider upon package arrival.
                  </div>
                )}

                {payError && (
                  <p className="text-xs text-rose-600 font-semibold">
                    Please select a payment method before proceeding.
                  </p>
                )}

                <div className="flex gap-2 justify-end mt-2">
                  <Btn label="← Back" onClick={() => setStep(2)} />
                  <Btn
                    label="Place Order →"
                    filled
                    onClick={() => {
                      if (method) {
                        setPayError(false);
                        setStep(4);
                      } else {
                        setPayError(true);
                      }
                    }}
                  />
                </div>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-8 text-center overflow-hidden bg-white">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <IcCheckCircle size={36} />
              </div>
              <h3 className="font-display font-bold text-2xl text-[color:var(--brand-ink)]">
                Order Received
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Your order <strong className="font-mono font-bold text-[color:var(--coral)]">#HB-005</strong> has been logged and queued for ice packing.
              </p>

              <div className="max-w-md mx-auto my-6 border border-gray-200 rounded-[var(--radius-sm)] p-4 text-left text-xs text-gray-700 bg-[#FAF8F5] flex flex-col gap-2">
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Order Ref</span>
                  <span className="font-mono font-bold text-[color:var(--coral)]">#HB-005</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Status</span>
                  <Tag label="Pending Confirmation" color="warning" />
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium text-gray-800">{method || "COD"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Total Amount</span>
                  <span className="font-mono font-bold text-sm text-[color:var(--coral)]">₱{total}</span>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Btn label="Track Status" onClick={onTrack} />
                <Btn label="Return to Catalog" filled onClick={onBack} />
              </div>
            </Card>
          )}

          <CheckoutNotes items={STEP_NOTES[step]} />
        </div>

        {/* 30% Price Breakdown Sidebar */}
        <div className="w-full md:basis-[30%] md:min-w-0 shrink-0">
          <Card className="p-5 bg-white">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Summary</h4>
            <div className="flex flex-col gap-2 mb-3">
              {cart.map(item => (
                <div key={`${item.id}-${item.prep}`} className="flex justify-between text-xs text-gray-700">
                  <span className="truncate pr-2 font-medium">{item.name} ×{item.qty}</span>
                  <span className="shrink-0 font-mono font-semibold">₱{item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <Divider />
            <div className="flex justify-between text-xs text-gray-600 mb-1.5">
              <span>Subtotal</span>
              <span className="font-mono">₱{subtotal}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mb-1.5">
              <span>Linis &amp; Kaliskis (Prep)</span>
              <span className="text-emerald-700 font-bold text-[11px] uppercase tracking-wide">Free</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mb-1.5">
              <span>Insulated Cold-Box + Ice</span>
              <span className="text-emerald-700 font-bold text-[11px] uppercase tracking-wide">Free</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Courier Dispatch (Lalamove)</span>
              <span>{deliveryFee === 0 ? <span className="text-emerald-700 font-bold text-[11px] uppercase tracking-wide">Free</span> : <span className="font-mono">₱{deliveryFee}</span>}</span>
            </div>
            <div className="flex justify-between items-baseline font-bold text-base text-[color:var(--brand-ink)] pt-3 border-t border-gray-200">
              <span className="font-display">Total</span>
              <span className="font-mono text-lg text-[color:var(--coral)]">₱{total}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Order Tracking View ──────────────────────────────────────────────────────

function TrackOrderView({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<typeof ORDERS[0] | null | "not-found">(null);

  function handleTrack() {
    const found = ORDERS.find(o => o.id.toLowerCase() === query.trim().toLowerCase());
    setResult(found ?? "not-found");
  }

  const stepIndex = result && result !== "not-found" ? STATUS_STEPS.indexOf(result.status) : -1;

  return (
    <div className="h-full bg-[#FAF8F5] overflow-y-auto relative">
      <div className="border-b border-[#E5DFD5] px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 bg-white">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-[color:var(--coral)] text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          ← Return to Market
        </button>
        <BrandLogo size="sm" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">
        <div className="market-card p-6 md:p-8 mb-6 bg-white">
          <h2 className="font-display font-bold text-2xl text-[color:var(--brand-ink)]">
            Track Your Fresh Seafood Catch
          </h2>
          <p className="text-xs text-gray-500 mt-1 mb-5">
            Enter your Order ID (e.g. #HB-001) to view status updates
          </p>
          <div className="flex gap-2">
            <FieldInput
              placeholder="e.g. #HB-001"
              value={query}
              onChange={setQuery}
            />
            <Btn label="Track Status" filled onClick={handleTrack} />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Demo order IDs: #HB-001, #HB-002, #HB-003, #HB-004
          </p>
        </div>

        {result === "not-found" && (
          <Card className="p-6 text-center border-rose-200 bg-rose-50/50">
            <p className="text-xs font-bold text-rose-700">Order not found.</p>
            <p className="text-xs text-gray-500 mt-1">Please check your ID and retry.</p>
          </Card>
        )}

        {result && result !== "not-found" && (
          <Card className="p-6 flex flex-col gap-6 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs text-gray-500">Order Reference</span>
                <p className="font-mono font-bold text-lg text-[color:var(--coral)]">{result.id}</p>
              </div>
              <Tag label={result.status} color="cyan" />
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className="flex-1 text-center min-w-[70px]">
                  <div
                    className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-mono font-bold mb-1.5 transition-colors ${
                      i <= stepIndex ? "bg-[color:var(--coral)] text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i <= stepIndex ? "✓" : i + 1}
                  </div>
                  <p className={`text-[10px] font-semibold tracking-wide ${i <= stepIndex ? "text-[color:var(--brand-ink)]" : "text-gray-400"}`}>
                    {s}
                  </p>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="text-xs flex flex-col gap-2 pt-4 border-t border-gray-100 text-gray-700">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Customer</span>
                <span className="font-bold text-gray-800">{result.customer}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Items</span>
                <span>{result.items}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Payment</span>
                <span>{result.payment}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Total</span>
                <span className="font-mono font-bold text-base text-[color:var(--coral)]">₱{result.total}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── About View ───────────────────────────────────────────────────────────────

function AboutView({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full bg-[#FAF8F5] overflow-y-auto relative">
      <div className="border-b border-[#E5DFD5] px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 bg-white">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-[color:var(--coral)] text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          ← Return to Market
        </button>
        <BrandLogo size="sm" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-8 relative z-10">
        <div className="text-center">
          <Tag label="Academic Capstone" color="cyan" />
          <h1 className="font-display font-black text-3xl md:text-4xl text-[color:var(--brand-ink)] mt-3">
            About Hook &amp; Box
          </h1>
          <p className="text-sm text-gray-600 max-w-lg mx-auto mt-2 leading-relaxed">
            Delivering fresh wet-market catch directly to Dasmariñas households with real-time stock ledger transparency.
          </p>
        </div>

        <Card className="p-6 md:p-8 bg-white">
          <h2 className="font-display font-bold text-lg text-[color:var(--brand-ink)] mb-3">Our Mission</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
            Early-morning wet market trips take substantial time and energy. Hook &amp; Box connects local wet-market fishmongers with residential consumers, packing morning catches directly into cold-chain boxes for rapid Lalamove dispatch.
          </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Every gram of stock is tracked using an immutable, append-only stock movement ledger to guarantee freshness and prevent overselling.
          </p>
        </Card>

        <div>
          <h2 className="font-display font-bold text-lg text-[color:var(--brand-ink)] mb-4 text-center">Meet the Capstone Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {TEAM.map(m => (
              <Card key={m.name} className="p-4 text-center flex flex-col items-center bg-white">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-[color:var(--coral)] font-mono font-bold text-lg flex items-center justify-center mb-2">
                  {m.initial}
                </div>
                <p className="text-xs font-bold text-[color:var(--brand-ink)]">{m.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{m.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Contact View ─────────────────────────────────────────────────────────────

function ContactView({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full bg-[#FAF8F5] overflow-y-auto relative">
      <div className="border-b border-[#E5DFD5] px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 bg-white">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-[color:var(--coral)] text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          ← Return to Market
        </button>
        <BrandLogo size="sm" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-3xl md:text-4xl text-[color:var(--brand-ink)]">
            Contact Hook &amp; Box
          </h1>
          <p className="text-xs text-gray-500 mt-1">Questions, special catches, or bulk inquiries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 flex flex-col gap-4 bg-white">
            <h2 className="font-bold text-sm text-[color:var(--brand-ink)]">Contact Information</h2>
            <div className="flex flex-col gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-orange-100 text-[color:var(--coral)] flex items-center justify-center shrink-0">
                  <IcPhone size={15} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Phone</p>
                  <p className="font-mono text-gray-500">0917-XXX-XXXX</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-orange-100 text-[color:var(--coral)] flex items-center justify-center shrink-0">
                  <IcClock size={15} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Operating Hours</p>
                  <p className="text-gray-500">Mon–Sat · 6:00 AM – 6:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-orange-100 text-[color:var(--coral)] flex items-center justify-center shrink-0">
                  <IcTruck size={15} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Delivery Zone</p>
                  <p className="text-gray-500">Dasmariñas City, Cavite</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <h2 className="font-bold text-sm text-[color:var(--brand-ink)] mb-3">Send a Message</h2>
            <div className="flex flex-col gap-3">
              <div>
                <Label>Your Name</Label>
                <div className="mt-1"><FieldInput placeholder="Maria Santos" /></div>
              </div>
              <div>
                <Label>Contact Number</Label>
                <div className="mt-1"><FieldInput placeholder="09XX XXX XXXX" /></div>
              </div>
              <div>
                <Label>Message</Label>
                <textarea
                  rows={3}
                  placeholder="How can we assist you with your seafood order?"
                  className="w-full border border-gray-200 rounded-[var(--radius-sm)] px-3 py-2 text-xs text-gray-700 placeholder-gray-400 bg-white outline-none focus:border-[color:var(--coral)] resize-none mt-1 shadow-2xs"
                />
              </div>
              <Btn label="Send Inquiry" filled full />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── StoreApp Root Component ──────────────────────────────────────────────────

const NAV_ICON: Record<View, React.ReactNode> = {
  client: <IcCart size={13} />,
  admin: <IcGear size={13} />,
  payment: <IcCard size={13} />,
  track: <IcSearch size={13} />,
  about: <IcUsers size={13} />,
  contact: <IcPhone size={13} />,
};

const NAV_VIEWS: [View, string][] = [
  ["client", "Catalog"],
  ["admin", "Admin"],
  ["payment", "Checkout"],
  ["track", "Track"],
  ["about", "About"],
  ["contact", "Contact"],
];

export default function StoreApp({
  products, categories,
}: {
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

  const defaultCart: CartItem[] = products.slice(0, 2).map(p => ({
    id: p.id, name: p.name, price: p.price, unit: p.unit, qty: 1, prep: "Cleaned & Scaled",
  }));

  return (
    <div className="size-full flex flex-col overflow-hidden bg-[#FAF8F5]">
      {/* Top Demo Navigation Switcher */}
      <div className="flex items-center gap-1.5 bg-[#0B1E24] text-white shrink-0 overflow-x-auto border-b border-white/10 z-40 px-3 py-1.5">
        <div className="flex items-center gap-2 pr-2 text-xs text-gray-300 font-medium whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="hidden sm:inline text-gray-400">Prototype Views:</span>
        </div>
        {NAV_VIEWS.map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-xs)] whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              view === v ? "bg-[color:var(--coral)] text-white shadow-2xs" : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            {NAV_ICON[v]}{label}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-gray-400 px-3 whitespace-nowrap hidden md:block">
          Dasmariñas City · Cavite Pier
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {view === "client" && (
          <ClientView
            products={products}
            categories={categories}
            onCheckout={handleCheckout}
            onNavigate={setView}
          />
        )}
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
