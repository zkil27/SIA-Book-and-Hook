import Link from "next/link";

/**
 * Hook & Box wordmark, rebuilt from the brand art (public/imports/Frame_15.png):
 * the box-built hook mark plus heavy condensed lettering, HOOK& in teal and
 * BOX in mint, with the white sticker keyline.
 */
export function Logo({
  size = "md",
  href = "/",
  tone = "light",
}: {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  tone?: "light" | "dark";
}) {
  const mark = size === "sm" ? "h-7" : size === "lg" ? "h-12" : "h-9";
  const text = size === "sm" ? "text-[22px]" : size === "lg" ? "text-[40px]" : "text-[28px]";
  const body = (
    <span className="inline-flex items-center gap-1.5 select-none" aria-label="Hook & Box">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/imports/Vector.png" alt="" className={`${mark} w-auto drop-shadow-[0_2px_0_rgba(11,79,92,0.25)]`} />
      <span className={`sign sticker ${text} leading-none ${tone === "dark" ? "[text-shadow:none]" : ""}`} aria-hidden>
        <span className="text-teal">HOOK&amp;</span>
        <span className="text-mint">BOX</span>
      </span>
    </span>
  );
  if (!href) return body;
  return (
    <Link href={href} className="rounded-md" aria-label="Hook & Box home">
      {body}
    </Link>
  );
}
