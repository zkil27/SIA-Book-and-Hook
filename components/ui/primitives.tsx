import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { categoryHue, STATUS_META, type OrderStatusKey } from "@/lib/meta";

// ── Button ───────────────────────────────────────────────────────────────────

type Variant = "primary" | "tarp" | "marker" | "ghost" | "outline" | "danger" | "ink";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-teal-deep text-white shadow-[0_2px_0_var(--color-teal-ink)] hover:bg-[#0f6b7e] active:shadow-none active:translate-y-[2px]",
  tarp: "bg-tarp text-ink shadow-[0_2px_0_var(--color-tarp-deep)] hover:bg-[#ffcb1f] active:shadow-none active:translate-y-[2px]",
  marker:
    "bg-marker text-white shadow-[0_2px_0_var(--color-marker-deep)] hover:bg-[#c71f35] active:shadow-none active:translate-y-[2px]",
  ink: "bg-ink text-white shadow-[0_2px_0_#000] hover:bg-[#222b2f] active:shadow-none active:translate-y-[2px]",
  ghost: "text-ink-2 hover:bg-ice-2 hover:text-ink",
  outline: "bg-paper text-ink ring-1 ring-inset ring-ice-3 hover:ring-ink-3 hover:bg-ice",
  danger: "bg-paper text-marker-deep ring-1 ring-inset ring-marker/40 hover:bg-marker-soft",
};
const SIZE: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-[10px]",
  lg: "h-12 px-5 text-[15px] gap-2 rounded-xl",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `inline-flex items-center justify-center font-semibold whitespace-nowrap select-none transition-[transform,background-color,box-shadow,color] duration-150 ease-[var(--ease-out-quart)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${VARIANT[variant]} ${SIZE[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  ...rest
}: ComponentProps<"button"> & { variant?: Variant; size?: Size; loading?: boolean }) {
  return (
    <button {...rest} disabled={rest.disabled || loading} className={buttonClass(variant, size, className)}>
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link {...rest} className={buttonClass(variant, size, className)} />;
}

// ── Fields ───────────────────────────────────────────────────────────────────

export const fieldClass =
  "w-full h-11 rounded-[10px] bg-paper px-3.5 text-[15px] text-ink placeholder:text-ink-3/70 ring-1 ring-inset ring-ice-3 outline-none transition-shadow focus:ring-2 focus:ring-teal-deep aria-invalid:ring-2 aria-invalid:ring-marker";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink-2">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[13px] font-medium text-marker-deep" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={`${fieldClass} h-auto min-h-20 py-2.5 resize-y ${props.className ?? ""}`}
    />
  );
}

export function Select(props: ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={`${fieldClass} pr-9 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2356656b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat cursor-pointer ${props.className ?? ""}`}
    />
  );
}

// ── Chips ────────────────────────────────────────────────────────────────────

const TONE: Record<string, string> = {
  yellow: "bg-tarp-soft text-[#6b4e00] ring-tarp-deep/40",
  teal: "bg-mint-soft text-teal-ink ring-teal/40",
  violet: "bg-violet-soft text-[#3b2a78] ring-violet/30",
  green: "bg-leaf-soft text-[#14532f] ring-leaf/30",
  gray: "bg-ice-2 text-ink-2 ring-ice-3",
  red: "bg-marker-soft text-marker-deep ring-marker/30",
};

export function Chip({
  tone = "gray",
  children,
  className = "",
}: {
  tone?: keyof typeof TONE;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[12px] font-semibold leading-5 ring-1 ring-inset whitespace-nowrap ${TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusChip({ status }: { status: OrderStatusKey }) {
  const meta = STATUS_META[status];
  return (
    <Chip tone={meta.tone}>
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {meta.label}
    </Chip>
  );
}

export function CategoryChip({ slug, name }: { slug: string; name: string }) {
  const hue = categoryHue(slug);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] font-semibold leading-5 whitespace-nowrap"
      style={{ backgroundColor: hue.soft, color: hue.ink }}
    >
      <span className="size-2 rounded-[3px]" style={{ backgroundColor: hue.bg }} aria-hidden />
      {name}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] bg-paper px-1 font-mono text-[11px] font-medium text-ink-2 ring-1 ring-inset ring-ice-3 shadow-[0_1px_0_var(--color-ice-3)]">
      {children}
    </kbd>
  );
}
