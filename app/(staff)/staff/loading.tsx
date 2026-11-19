/** Instant feedback between staff screens (and lets Next prefetch them). */
export default function StaffLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-3">
      <span className="block h-10 w-48 animate-pulse rounded-md bg-ice-3/70 motion-reduce:animate-none" />
      {[0, 1, 2, 3].map(i => (
        <span key={i} className="block h-20 animate-pulse rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3 motion-reduce:animate-none" />
      ))}
    </div>
  );
}
