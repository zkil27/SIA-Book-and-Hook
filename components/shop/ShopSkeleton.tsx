/**
 * Storefront page placeholder: a heading block and a grid of price-card
 * shapes. The pulse stops under prefers-reduced-motion.
 */
function Bar({ className = "" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-md bg-ice-3/70 motion-reduce:animate-none ${className}`} />;
}

export function ShopPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12" aria-busy="true" aria-label="Loading">
      <Bar className="h-14 w-[min(28rem,80%)] sm:h-20" />
      <Bar className="mt-4 h-4 w-64 max-w-full" />
      <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <Bar className="aspect-[4/3] w-full rounded-[var(--radius-card)]" />
            <Bar className="mt-3 h-5 w-2/3" />
            <Bar className="mt-2 h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
