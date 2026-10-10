import Link from "next/link";
import { pesoNumber } from "@/lib/money";

export type CrawlEntry = { id: string; label: string; price: number; unit: string; changed: boolean };

/**
 * The tarp banner over the stall: today's real prices scrolling past.
 * Prices changed today flash red. Hover or focus pauses it.
 */
export function TarpCrawl({ entries }: { entries: CrawlEntry[] }) {
  if (entries.length === 0) return null;
  const loop = [...entries, ...entries];
  return (
    <div className="relative flex h-10 items-stretch overflow-hidden bg-tarp text-ink" aria-label="Today's prices">
      <div className="relative z-10 flex shrink-0 items-center bg-ink px-3 sm:px-4">
        <span className="sign text-[17px] text-tarp">Today&apos;s prices</span>
      </div>
      <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_24px,#000_calc(100%-24px),transparent)]">
        <ul className="flex w-max animate-crawl items-center gap-0 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
          {loop.map((e, i) => (
            <li key={`${e.id}-${i}`} className="flex items-center" aria-hidden={i >= entries.length}>
              <Link
                href={`/p/${e.id}`}
                tabIndex={i >= entries.length ? -1 : undefined}
                className="flex h-10 items-center gap-2 px-4 whitespace-nowrap"
              >
                <span className="sign text-[17px]">{e.label}</span>
                <span
                  className={`font-marker text-[17px] leading-none tabular rounded px-1 ${
                    e.changed ? "animate-[flash-price_1.6s_ease-in-out_3] text-marker-deep" : "text-marker-deep"
                  }`}
                >
                  ₱{pesoNumber(e.price)}
                  <span className="text-[12px] text-ink/70">/{e.unit}</span>
                </span>
                {e.changed && (
                  <span className="rounded-sm bg-marker px-1.5 py-px text-[11px] font-bold uppercase tracking-wide text-white">
                    New price
                  </span>
                )}
              </Link>
              <span aria-hidden className="size-1.5 rotate-45 bg-ink/50" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
