import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { requireRole } from "@/lib/session";
import { STAFF_ROLES } from "@/lib/roles";
import { StaffShell } from "@/components/staff/StaffShell";
import { ToastProvider } from "@/components/ui/toast";
import { DevSwitcherGate } from "@/components/dev/DevSwitcherGate";

export const metadata: Metadata = { title: { default: "Staff", template: "%s · Hook & Box staff" } };

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="min-h-dvh bg-ice" />}>
        <StaffGate>{children}</StaffGate>
      </Suspense>
    </ToastProvider>
  );
}

/** Second line of defence after proxy.ts; each page also checks its own roles. */
async function StaffGate({ children }: { children: ReactNode }) {
  const me = await requireRole(STAFF_ROLES, "/staff");
  return (
    <>
      <DevSwitcherGate user={me} />
      <StaffShell role={me.role} name={me.name ?? me.email}>
        {children}
      </StaffShell>
    </>
  );
}
