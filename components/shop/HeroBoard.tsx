import Link from "next/link";
import type { CSSProperties } from "react";
import type { ShopProduct } from "@/lib/catalog";
import { categoryHue, splitName, tiltFor, unitFor } from "@/lib/meta";
import { PriceTag } from "@/components/ui/PriceTag";

/**
 * The first viewport: three big price cards stuck into iced catch photos.
 * On load each cardboard tag drops in and wobbles to rest, staggered,
 * like a vendor jabbing the day's prices into the ice (CSS: tag-drop).
 */
export function HeroBoard({ featured }: { featured: ShopProduct[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
      {featured.map((p, i) => {
        const v = p.variants.find(x => x.stock > 0) ?? p.variants[0];
        const { local, english } = splitName(p.name);
        const hue = categoryHue(p.category.slug);
        const tilt = tiltFor(p.id, 5);
        return (
          <Link
            key={p.id}
            href={`/p/${p.id}`}
            className={`group relative block overflow-hidden rounded-[var(--radius-card)] bg-ice-2 ${
              i === 0 ? "aspect-[4/3] sm:aspect-[4/5]" : "aspect-[16/10] sm:aspect-[4/5]"
            }`}
          >
            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image}
                alt=""
                fetchPriority={i === 0 ? "high" : "auto"}
                className="size-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/0 to-ink/0" aria-hidden />
            <div
              className="absolute left-1/2 top-[12%] -translate-x-1/2 animate-[tag-drop_900ms_cubic-bezier(0.22,1,0.36,1)_both]"
              style={{ animationDelay: `${150 + i * 140}ms`, "--drop-from": `${tilt * 3}deg` } as CSSProperties}
            >
              <PriceTag name={local} price={v.price} unit={unitFor(v.name)} tilt={tilt} size="lg" />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
              <div>
                <p className="text-lg font-bold leading-tight drop-shadow">{english ?? local}</p>
                <p className="text-sm text-white/85">{v.name}</p>
              </div>
              <span className="rounded-md px-2 py-1 text-[12px] font-bold" style={{ backgroundColor: hue.soft, color: hue.ink }}>
                {p.category.name}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
