/**
 * Tiny shared helpers for the dev verification scripts in this folder.
 *
 * These scripts are NOT an automated test suite (the project scope explicitly
 * excludes one — see docs/scope.md). They are standalone operational checks you
 * run by hand against the database to verify the load-bearing invariants that
 * are painful to check manually: the append-only stock ledger, money-as-centavos,
 * soft-deletes, order-total stability, and Supabase connection headroom.
 *
 * Run with tsx, e.g. `npm run check:ledger`.
 *
 * Note: like prisma/seed.ts, these are standalone CLI scripts and instantiate
 * their own short-lived PrismaClient, which disconnects at the end, so it does
 * not affect app-runtime connection counts. The ledger and data checks share
 * their logic with the /admin/dev Checks page via lib/dev/checks.ts.
 */

import type { CheckReport } from "../lib/dev/checks";

const peso = (centavos: number) =>
  `\u20b1${(centavos / 100).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

class Report {
  private title: string;
  private passes = 0;
  private failures: string[] = [];
  private warnings: string[] = [];

  constructor(title: string) {
    this.title = title;
    console.log(`\n=== ${title} ===\n`);
  }

  info(msg: string) {
    console.log(`  ${msg}`);
  }

  pass(msg: string) {
    this.passes++;
    console.log(`  \u2713 ${msg}`);
  }

  fail(msg: string) {
    this.failures.push(msg);
    console.log(`  \u2717 ${msg}`);
  }

  warn(msg: string) {
    this.warnings.push(msg);
    console.log(`  ! ${msg}`);
  }

  /** Assert a boolean; records a pass or fail with the given messages. */
  check(ok: boolean, passMsg: string, failMsg: string) {
    if (ok) this.pass(passMsg);
    else this.fail(failMsg);
  }

  /**
   * Print the summary and exit with a non-zero code if anything failed, so the
   * script is CI/terminal friendly (a hook or `npm run` chain can react to it).
   */
  finish(): never {
    console.log(
      `\n--- ${this.title}: ${this.passes} passed, ${this.failures.length} failed, ${this.warnings.length} warning(s) ---\n`
    );
    if (this.failures.length > 0) {
      console.log("FAILURES:");
      for (const f of this.failures) console.log(`  \u2717 ${f}`);
      console.log("");
      process.exit(1);
    }
    process.exit(0);
  }
}

/** Print a shared CheckReport (lib/dev/checks.ts) and exit 1 on any failure. */
function printReport(report: CheckReport): never {
  const r = new Report(report.title);
  for (const c of report.results) {
    const text = c.detail ? `${c.name} (${c.detail})` : c.name;
    if (c.status === "pass") r.pass(text);
    else if (c.status === "warn") r.warn(text);
    else r.fail(text);
  }
  console.log("");
  for (const line of report.info) r.info(line);
  r.info(`Checked in ${report.ms}ms`);
  return r.finish();
}

export { Report, peso, printReport };
