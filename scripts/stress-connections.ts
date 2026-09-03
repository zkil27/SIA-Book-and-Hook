/**
 * Connection / concurrency stress test.
 *
 * Fires many queries concurrently through a SINGLE PrismaClient to surface two
 * classes of problem before Vercel + Supabase do:
 *
 *   1. Pool exhaustion / "Too many connections" — the classic Supabase free-tier
 *      failure. The app must run through the pooled DATABASE_URL (port 6543,
 *      ?pgbouncer=true) and reuse the singleton. If your local .env points at
 *      the direct 5432 URL, or you leak clients, this test will start erroring
 *      under load.
 *   2. Latency under concurrency — reports p50/p95/max so you can see whether
 *      the free-tier DB keeps up with a burst.
 *
 * This is a light read-only load generator, not a benchmark. It only issues
 * SELECT/count queries. Safe to run against the seeded demo DB.
 *
 * Usage:
 *   npm run stress                 # defaults: 100 queries, concurrency 20
 *   npm run stress -- 500 50       # 500 queries, concurrency 50
 */
import { PrismaClient } from "@prisma/client";
import { Report } from "./_report";

const prisma = new PrismaClient();

// A grab-bag of cheap read queries to rotate through, so we exercise several
// tables rather than hammering one.
const QUERIES: Array<() => Promise<unknown>> = [
  () => prisma.$queryRaw`SELECT 1`,
  () => prisma.product.count(),
  () => prisma.productVariant.count(),
  () => prisma.stockMovement.count(),
  () => prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
  () =>
    prisma.productVariant.findMany({
      take: 5,
      include: { stockMovements: true },
    }),
  () => prisma.category.findMany({ include: { products: true } }),
];

function parseArgs() {
  const total = Number(process.argv[2]) || 100;
  const concurrency = Number(process.argv[3]) || 20;
  return { total, concurrency };
}

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx];
}

async function main() {
  const { total, concurrency } = parseArgs();
  const r = new Report(
    `Connection stress test (${total} queries, concurrency ${concurrency})`
  );

  // Warm up one connection so the first-connect cost doesn't skew p50.
  await prisma.$queryRaw`SELECT 1`;
  r.pass("Initial connection established");

  const latencies: number[] = [];
  const errors: string[] = [];
  let inFlight = 0;
  let maxInFlight = 0;
  let dispatched = 0;

  const runOne = async () => {
    const q = QUERIES[dispatched % QUERIES.length];
    dispatched++;
    inFlight++;
    maxInFlight = Math.max(maxInFlight, inFlight);
    const start = Date.now();
    try {
      await q();
      latencies.push(Date.now() - start);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    } finally {
      inFlight--;
    }
  };

  // Worker-pool pattern: `concurrency` workers pull tasks until `total` is hit.
  const wallStart = Date.now();
  let launched = 0;
  const worker = async () => {
    while (launched < total) {
      launched++;
      await runOne();
    }
  };
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const wallMs = Date.now() - wallStart;

  latencies.sort((a, b) => a - b);
  const ok = latencies.length;
  const failed = errors.length;

  console.log("");
  r.info(`Completed:        ${ok}/${total} queries`);
  r.info(`Wall time:        ${wallMs}ms`);
  r.info(`Throughput:       ${((ok / wallMs) * 1000).toFixed(1)} queries/sec`);
  r.info(`Peak in-flight:   ${maxInFlight}`);
  if (ok > 0) {
    r.info(`Latency p50:      ${percentile(latencies, 50)}ms`);
    r.info(`Latency p95:      ${percentile(latencies, 95)}ms`);
    r.info(`Latency max:      ${latencies[latencies.length - 1]}ms`);
  }
  console.log("");

  r.check(
    failed === 0,
    `No query errors under load (${ok} succeeded)`,
    `${failed} query/queries failed under load`
  );

  if (failed > 0) {
    // Show the distinct error messages — a connection-limit error is the smoking
    // gun for a misconfigured pooler URL or a client leak.
    const distinct = [...new Set(errors)].slice(0, 5);
    r.info("Distinct errors (first 5):");
    for (const e of distinct) r.info(`    ${e.split("\n")[0]}`);
    if (distinct.some((e) => /too many connections|connection pool|P2037|P1017/i.test(e))) {
      r.warn(
        "Looks like connection exhaustion. Confirm DATABASE_URL is the pooled " +
          "6543/?pgbouncer=true URL and that only the singleton client is used."
      );
    }
  }

  r.finish();
}

main()
  .catch((e) => {
    console.error("\nStress test crashed (could not complete):");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
