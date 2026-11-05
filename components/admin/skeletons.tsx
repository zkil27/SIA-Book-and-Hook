/**
 * Loading placeholders for the admin. Shapes mirror the real layout
 * (PageHeader + stat strip + panels) so content lands without a jump.
 * The pulse stops under prefers-reduced-motion.
 */

function Bar({ className = "" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-md bg-ice-3/70 motion-reduce:animate-none ${className}`} />;
}

export function AdminPageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mb-6">
        <Bar className="h-11 w-56 sm:h-12" />
        <Bar className="mt-3 h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] bg-ice-3 ring-1 ring-inset ring-ice-3 md:grid-cols-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="bg-paper px-5 py-4">
            <Bar className="h-3.5 w-24" />
            <Bar className="mt-2.5 h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        {[0, 1].map(i => (
          <div key={i} className="rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3">
            <div className="border-b border-ice-3 px-5 py-3.5">
              <Bar className="h-4 w-36" />
            </div>
            <div className="flex flex-col gap-3 p-5">
              {[0, 1, 2, 3].map(j => (
                <div key={j} className="flex items-center gap-3">
                  <Bar className="size-9 shrink-0 rounded-lg" />
                  <div className="flex-1">
                    <Bar className="h-3.5 w-2/3" />
                    <Bar className="mt-2 h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Whole-shell placeholder shown while the session check runs. */
export function AdminShellSkeleton() {
  return (
    <div className="min-h-dvh bg-ice">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col gap-2 border-r border-ice-3 bg-paper px-3 pt-5 lg:flex">
        <Bar className="mx-2 mb-4 h-7 w-32" />
        <Bar className="mb-3 h-9.5 w-full rounded-lg" />
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <Bar key={i} className="h-10 w-full rounded-lg opacity-60" />
        ))}
      </aside>
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-ice-3 bg-paper px-3 lg:hidden">
        <Bar className="h-7 w-28" />
      </header>
      <main className="pb-24 lg:pb-12 lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:pt-10">
          <AdminPageSkeleton />
        </div>
      </main>
    </div>
  );
}
