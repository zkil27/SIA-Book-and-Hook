import type { CSSProperties } from "react";
import { pesoNumber } from "@/lib/money";

/**
 * The cardboard price card stuck into the ice on a bamboo stick: species in
 * sign lettering, price in red marker. Tilted per product; straightens when
 * its parent `.group` is hovered or focused. A sold-out tag gets a marker
 * strike drawn across it.
 */
export function PriceTag({
  name,
  price,
  unit,
  tilt = -3,
  soldOut = false,
  size = "md",
  stick = true,
  className = "",
}: {
  name: string;
  price: number; // centavos
  unit: string;
  tilt?: number;
  soldOut?: boolean;
  size?: "sm" | "md" | "lg";
  stick?: boolean;
  className?: string;
}) {
  const pad = size === "lg" ? "px-5 pt-3 pb-3.5" : size === "sm" ? "px-2.5 pt-1.5 pb-2" : "px-3.5 pt-2 pb-2.5";
  const nameSize = size === "lg" ? "text-[30px]" : size === "sm" ? "text-[15px]" : "text-[20px]";
  const priceSize = size === "lg" ? "text-[44px]" : size === "sm" ? "text-[22px]" : "text-[30px]";
  return (
    <div
      className={`relative inline-block origin-bottom [rotate:var(--tilt)] transition-[rotate,translate] duration-300 ease-[var(--ease-out-expo)] group-hover:[rotate:0deg] group-hover:-translate-y-1 group-focus-within:[rotate:0deg] ${className}`}
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
    >
      {stick && (
        <span
          aria-hidden
          className="absolute left-1/2 top-full h-6 w-[5px] -translate-x-1/2 rounded-b-sm bg-gradient-to-r from-[#c9a46a] via-[#e3c793] to-[#b08850]"
        />
      )}
      <div className={`cardboard relative rounded-[5px] ${pad} text-center`}>
        <div className={`sign ${nameSize} text-ink`}>{name}</div>
        <div className={`font-marker ${priceSize} leading-[1.05] text-marker-deep tabular whitespace-nowrap`}>
          <span className="text-[0.6em] align-[0.35em] mr-0.5">₱</span>
          {pesoNumber(price)}
          <span className="text-[0.45em] text-ink/80 ml-1">/{unit}</span>
        </div>
        {soldOut && (
          <svg
            aria-hidden
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-1 top-1/2 h-8 -translate-y-1/2 overflow-visible"
          >
            <path
              d="M3 30 C 30 22, 60 14, 97 8"
              fill="none"
              stroke="var(--color-marker)"
              strokeWidth="5"
              strokeLinecap="round"
              pathLength={1}
              className="[stroke-dasharray:1] [stroke-dashoffset:1] animate-[strike_480ms_var(--ease-out-quart)_200ms_forwards]"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
