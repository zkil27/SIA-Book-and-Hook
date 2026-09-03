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
 * their own PrismaClient rather than importing the app singleton from
 * @/lib/prisma (which is marked `server-only`). The process is short-lived and
 * disconnects at the end, so it does not affect app-runtime connection counts.
 */

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

export { Report, peso };
