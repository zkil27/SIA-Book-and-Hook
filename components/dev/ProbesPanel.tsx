"use client";

import { useState, useTransition } from "react";
import { Gauge } from "lucide-react";
import { runProbes, type ProbeRow } from "@/lib/actions/dev";
import { fmtTime } from "@/lib/time";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { Empty, Ms, OutcomeChip } from "./kit";

const SLOW_AT = 300;

/**
 * Runs each data function the pages use three times on the server and shows
 * the timings. Read-only. Run it on the deployed site for real numbers: local
 * runs measure your machine and your distance to Singapore.
 */
export function ProbesPanel() {
  const toast = useToast();
  const [rows, setRows] = useState<ProbeRow[] | null>(null);
  const [at, setAt] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run() {
    start(async () => {
      const res = await runProbes();
      if (!res.ok) return toast({ title: "Probes didn't run", description: res.error, tone: "error" });
      setRows(res.data.rows);
      setAt(res.data.at);
      const slow = res.data.rows.filter(r => r.median > SLOW_AT).length;
      toast({ title: "Probes finished", description: slow ? `${slow} over ${SLOW_AT} ms.` : `All under ${SLOW_AT} ms.` });
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-ice-3 px-5 py-3">
        <Button size="sm" onClick={run} loading={pending}>
          {!pending && <Gauge className="size-3.5" aria-hidden />}
          {rows ? "Run probes again" : "Run probes"}
        </Button>
        <p className="text-[13px] text-ink-3">
          {at ? `Last run ${fmtTime(at)} · medians over ${SLOW_AT} ms are flagged` : "About 25 reads, one after another. Takes a few seconds."}
        </p>
      </div>
      {!rows ? (
        <Empty>No timings yet.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-ice-3 bg-ice/60 text-left text-[12px] font-bold uppercase tracking-wider text-ink-3">
                <th className="px-5 py-2.5">Read</th>
                <th className="px-5 py-2.5 text-right">Median</th>
                <th className="px-5 py-2.5 text-right">Runs</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ice-2">
              {rows.map(r => (
                <tr key={r.name}>
                  <td className="px-5 py-2.5 font-semibold text-ink">
                    {r.name}
                    {r.error && <p className="break-words font-mono text-[12px] font-normal text-marker-deep">{r.error}</p>}
                  </td>
                  <td className="px-5 py-2.5 text-right">{r.runs.length ? <Ms value={r.median} slowAt={SLOW_AT} /> : "—"}</td>
                  <td className="tabular px-5 py-2.5 text-right font-mono text-[12px] text-ink-3">{r.runs.join(" · ")}</td>
                  <td className="px-5 py-2.5 text-right">
                    <OutcomeChip outcome={r.error ? "fail" : r.median > SLOW_AT ? "warn" : "pass"}>
                      {r.error ? "Error" : r.median > SLOW_AT ? "Slow" : "OK"}
                    </OutcomeChip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
