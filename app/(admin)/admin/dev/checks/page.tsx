import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { runDataChecks, runLedgerChecks } from "@/lib/dev/checks";
import { DbOffline, PageHeader, Panel } from "@/components/admin/kit";
import { ChecksList } from "@/components/dev/ChecksList";
import { ProbesPanel } from "@/components/dev/ProbesPanel";
import { RefreshButton } from "@/components/dev/RefreshButton";

export const metadata = { title: "Checks and timing" };

export default function DevChecksPage() {
  return (
    <>
      <PageHeader
        title="Checks and timing"
        sub="The same integrity checks as npm run check:ledger and check:data, plus timings for the reads every page makes."
        actions={<RefreshButton label="Re-run checks" />}
      />
      <div className="flex flex-col gap-6">
        <Panel title="Timing probes" pad={false}>
          <ProbesPanel />
        </Panel>
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Stock ledger" pad={false}>
            <Suspense fallback={<p className="p-5 text-sm text-ink-3">Checking every movement…</p>}>
              <Report kind="ledger" />
            </Suspense>
          </Panel>
          <Panel title="Data integrity" pad={false}>
            <Suspense fallback={<p className="p-5 text-sm text-ink-3">Checking orders and users…</p>}>
              <Report kind="data" />
            </Suspense>
          </Panel>
        </div>
      </div>
    </>
  );
}

async function Report({ kind }: { kind: "ledger" | "data" }) {
  const report = await (kind === "ledger" ? runLedgerChecks(prisma) : runDataChecks(prisma)).catch(() => null);
  return report ? <ChecksList report={report} /> : <DbOffline />;
}
