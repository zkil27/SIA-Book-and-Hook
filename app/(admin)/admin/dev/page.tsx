import Link from "next/link";
import { Suspense } from "react";
import { envInfo, pingDb, rowCounts } from "@/lib/dev/health";
import { openTestOrders } from "@/lib/dev/scenarios";
import { peso } from "@/lib/money";
import { DbOffline, PageHeader, Panel } from "@/components/admin/kit";
import { Empty, Facts, Ms, OutcomeChip } from "@/components/dev/kit";
import { RefreshButton } from "@/components/dev/RefreshButton";
import { StatusChip } from "@/components/ui/primitives";

export const metadata = { title: "Overview" };

export default function DevOverviewPage() {
  const env = envInfo();
  const region =
    env.regionMatch === "match" ? (
      <OutcomeChip outcome="pass">Same region</OutcomeChip>
    ) : env.regionMatch === "mismatch" ? (
      <OutcomeChip outcome="fail">Different regions</OutcomeChip>
    ) : (
      <OutcomeChip outcome="warn">Unknown (not on Vercel)</OutcomeChip>
    );

  return (
    <>
      <PageHeader title="Overview" sub="Is it healthy, is it fast, and is test data cleaned up?" actions={<RefreshButton />} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Environment">
          <Facts
            rows={[
              ["Runtime", `${env.nodeEnv}${env.vercelEnv ? ` · Vercel ${env.vercelEnv}` : " · local"}`],
              ["Commit", env.commit ? <span className="font-mono">{env.commit}</span> : "—"],
              ["Versions", `Next ${env.next} · Prisma ${env.prisma}`],
              [
                "Function region",
                env.functionRegion ? `${env.functionRegion}${env.functionAws ? ` (${env.functionAws})` : ""}` : "— (local)",
              ],
              ["Database region", env.dbRegion ?? (env.dbHost ? "unrecognised host" : "DATABASE_URL not set")],
              ["Region check", region],
              [
                "Pool settings",
                <span key="pool" className="font-mono text-[13px]">
                  pgbouncer={String(env.dbParams.pgbouncer)} · connect_timeout={env.dbParams.connectTimeout ?? "default"} ·
                  pool_timeout={env.dbParams.poolTimeout ?? "default"}
                </span>,
              ],
            ]}
          />
          {env.regionMatch === "mismatch" && (
            <p className="mt-4 rounded-lg bg-marker-soft px-3.5 py-2.5 text-[13px] text-marker-deep">
              Every query crosses regions. Set <code className="font-mono">&quot;regions&quot;: [&quot;sin1&quot;]</code> in
              vercel.json (or Vercel → Settings → Functions) to run next to the database.
            </p>
          )}
        </Panel>

        <Panel title="Database round trip">
          <Suspense fallback={<p className="text-sm text-ink-3">Pinging…</p>}>
            <PingPanel />
          </Suspense>
        </Panel>

        <Panel title="Row counts" pad={false}>
          <Suspense fallback={<p className="p-5 text-sm text-ink-3">Counting…</p>}>
            <CountsPanel />
          </Suspense>
        </Panel>

        <Panel
          title="Open test orders"
          action={
            <Link href="/admin/dev/scenarios" className="text-[13px] font-semibold text-teal-deep hover:underline">
              Scenarios
            </Link>
          }
          pad={false}
        >
          <Suspense fallback={<p className="p-5 text-sm text-ink-3">Loading…</p>}>
            <TestOrdersPanel />
          </Suspense>
        </Panel>
      </div>
    </>
  );
}

async function PingPanel() {
  const ping = await pingDb();
  if (!ping.ok) {
    return (
      <div className="flex flex-col gap-3">
        <OutcomeChip outcome="fail">Unreachable after {ping.ms} ms</OutcomeChip>
        <p className="break-words font-mono text-[12px] text-marker-deep">{ping.error}</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center gap-3">
        <OutcomeChip outcome={ping.median > 100 ? "warn" : "pass"}>
          {ping.median > 100 ? "Slow round trips" : "Healthy"}
        </OutcomeChip>
        <span className="text-[13px] text-ink-3">5 × SELECT 1, one after another</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {(
          [
            ["Fastest", ping.min],
            ["Median", ping.median],
            ["Slowest", ping.max],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="rounded-lg bg-ice px-3 py-2.5">
            <p className="text-[12px] font-semibold text-ink-3">{k}</p>
            <p className="mt-0.5">
              <Ms value={v} slowAt={100} />
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[12px] text-ink-3">{ping.runs.join(" · ")} ms</p>
      <p className="mt-3 text-[13px] text-ink-2">
        A page makes several of these in sequence, so each extra millisecond here is paid a few times per page.
      </p>
    </div>
  );
}

async function CountsPanel() {
  const rows = await rowCounts().catch(() => null);
  if (!rows) return <DbOffline />;
  return (
      <table className="w-full text-sm">
        <tbody className="divide-y divide-ice-2">
          {rows.map(r => (
            <tr key={r.model}>
              <td className="px-5 py-2 font-mono text-[13px] text-ink-2">{r.model}</td>
              <td className="tabular px-5 py-2 text-right font-semibold text-ink">{r.n.toLocaleString("en-PH")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
}

async function TestOrdersPanel() {
  const t = await openTestOrders().catch(() => null);
  if (!t) return <DbOffline />;
  return (
      <div>
        <p className="border-b border-ice-3 px-5 py-3 text-[13px] text-ink-2">
          {t.orders.length} open · {t.held} unit{t.held === 1 ? "" : "s"} held · {t.cancelled} cleaned up ·{" "}
          {t.completed} completed (can&apos;t be cancelled)
        </p>
        {t.orders.length === 0 ? (
          <Empty>No open test orders. The demo data is clean.</Empty>
        ) : (
          <ul className="max-h-72 divide-y divide-ice-2 overflow-y-auto">
            {t.orders.map(o => (
              <li key={o.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                <Link href={`/admin/orders?open=${o.code}`} className="font-mono font-bold text-ink hover:underline">
                  {o.code}
                </Link>
                <StatusChip status={o.status} />
                <span className="ml-auto text-ink-3">
                  {o.held} held · {peso(o.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
}
