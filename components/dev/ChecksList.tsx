import type { CheckReport } from "@/lib/dev/checks";
import { OutcomeChip } from "./kit";

/** One integrity report: each check with its outcome, then the info lines. */
export function ChecksList({ report }: { report: CheckReport }) {
  const fails = report.results.filter(r => r.status === "fail").length;
  const warns = report.results.filter(r => r.status === "warn").length;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-ice-3 px-5 py-3">
        <OutcomeChip outcome={fails ? "fail" : warns ? "warn" : "pass"}>
          {fails ? `${fails} failed` : warns ? `${warns} warning${warns === 1 ? "" : "s"}` : "All passed"}
        </OutcomeChip>
        <span className="text-[13px] text-ink-3">
          {report.results.length} checks in <span className="tabular font-mono">{report.ms} ms</span>
        </span>
      </div>
      <ul className="divide-y divide-ice-2">
        {report.results.map(r => (
          <li key={r.name} className="flex items-start gap-3 px-5 py-2.5 text-sm">
            <span className="w-14 shrink-0 pt-px">
              <OutcomeChip outcome={r.status} />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-ink">{r.name}</p>
              {r.detail && <p className="break-words text-[13px] text-ink-3">{r.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
      {report.info.length > 0 && (
        <pre className="overflow-x-auto border-t border-ice-3 bg-ice/60 px-5 py-3 font-mono text-[12px] leading-relaxed text-ink-2">
          {report.info.join("\n")}
        </pre>
      )}
    </div>
  );
}
