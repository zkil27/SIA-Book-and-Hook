import { CloudOff } from "lucide-react";

/** Shown under the header while the storefront runs on the static catalog. */
export function OfflineBanner() {
  return (
    <div className="border-b border-tarp-deep/40 bg-tarp-soft">
      <p className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 text-sm text-[#5c4300] sm:px-6">
        <CloudOff className="size-4 shrink-0" aria-hidden />
        Our stock system is offline for a moment. You can browse today&apos;s catch, but ordering is paused.
      </p>
    </div>
  );
}
