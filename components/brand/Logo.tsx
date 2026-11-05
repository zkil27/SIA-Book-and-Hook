import Image from "next/image";
import Link from "next/link";
import markSrc from "@/public/imports/Vector.png";

// Display height per size; width follows the mark's 461×764 aspect ratio.
const MARK_PX = { sm: 24, md: 32, lg: 40 } as const;

/**
 * Hook & Box wordmark, rebuilt from the brand art (public/imports/Frame_15.png):
 * a teal plate carrying the box-built hook mark and heavy condensed lettering,
 * HOOK& in teal and BOX in mint, each with the white sticker keyline.
 */
export function Logo({ size = "md", href = "/" }: { size?: "sm" | "md" | "lg"; href?: string | null }) {
  const mark = size === "sm" ? "h-6" : size === "lg" ? "h-10" : "h-8";
  const text = size === "sm" ? "text-[21px]" : size === "lg" ? "text-[36px]" : "text-[27px]";
  const pad = size === "sm" ? "px-2 py-1 gap-1.5" : size === "lg" ? "px-3.5 py-2 gap-2.5" : "px-2.5 py-1.5 gap-2";
  const body = (
    <span
      className={`inline-flex items-center rounded-[10px] bg-teal shadow-[0_2px_0_#1d8197] select-none ${pad}`}
      aria-label="Hook & Box"
    >
      <Image
        src={markSrc}
        alt=""
        height={MARK_PX[size]}
        width={Math.round((MARK_PX[size] * 461) / 764)}
        className={`${mark} w-auto`}
      />
      <span className={`sign sticker ${text} leading-none tracking-[0.01em]`} aria-hidden>
        <span className="text-teal">HOOK&amp;</span>
        <span className="text-mint">BOX</span>
      </span>
    </span>
  );
  if (!href) return body;
  return (
    <Link href={href} className="rounded-[10px]" aria-label="Hook & Box home">
      {body}
    </Link>
  );
}
