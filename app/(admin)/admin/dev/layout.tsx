import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireDev } from "@/lib/dev/access";
import { DevNav } from "@/components/dev/DevNav";

export const metadata: Metadata = {
  title: { default: "Dev tools", template: "%s · Dev tools · Hook & Box" },
  robots: { index: false, follow: false },
};

/**
 * Developer-only section. requireDev() = signed-in ADMIN whose email is in
 * DEV_EMAILS; everyone else gets a 404. Every dev action re-checks it.
 */
export default async function DevLayout({ children }: { children: ReactNode }) {
  await requireDev();
  return (
    <div>
      <p className="mb-6 rounded-lg bg-ink px-4 py-2.5 font-mono text-[12px] leading-relaxed text-white/85">
        Developer tools · hidden from staff ·{" "}
        <span className="text-tarp">writes go to the shared demo database</span>
      </p>
      <DevNav />
      {children}
    </div>
  );
}
