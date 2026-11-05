import "server-only";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import pkg from "@/package.json";

/** Vercel function region → the AWS region it runs in (Supabase uses AWS region names). */
const VERCEL_TO_AWS: Record<string, string> = {
  sin1: "ap-southeast-1",
  hkg1: "ap-east-1",
  hnd1: "ap-northeast-1",
  kix1: "ap-northeast-3",
  icn1: "ap-northeast-2",
  bom1: "ap-south-1",
  syd1: "ap-southeast-2",
  iad1: "us-east-1",
  cle1: "us-east-2",
  sfo1: "us-west-1",
  pdx1: "us-west-2",
  yul1: "ca-central-1",
  gru1: "sa-east-1",
  fra1: "eu-central-1",
  cdg1: "eu-west-3",
  dub1: "eu-west-1",
  lhr1: "eu-west-2",
  arn1: "eu-north-1",
  cpt1: "af-south-1",
  dxb1: "me-central-1",
};

export type EnvInfo = {
  nodeEnv: string;
  vercelEnv: string | null;
  functionRegion: string | null;
  functionAws: string | null;
  dbHost: string | null;
  dbRegion: string | null;
  regionMatch: "match" | "mismatch" | "unknown";
  commit: string | null;
  next: string;
  prisma: string;
  devEmailsSet: boolean;
  dbParams: { pgbouncer: boolean; connectTimeout: string | null; poolTimeout: string | null; connectionLimit: string | null };
};

/** Environment facts. Reads only the host and query params of DATABASE_URL, never credentials. */
export function envInfo(): EnvInfo {
  let dbHost: string | null = null;
  let params = new URLSearchParams();
  try {
    const u = new URL(process.env.DATABASE_URL ?? "");
    dbHost = u.hostname;
    params = u.searchParams;
  } catch {
    /* unset or not a URL */
  }
  const dbRegion = dbHost ? /(?:^|\.|-)((?:ap|us|eu|ca|sa|me|af)-[a-z]+-\d)(?:\.|$)/.exec(dbHost)?.[1] ?? null : null;
  const functionRegion = process.env.VERCEL_REGION ?? null;
  const functionAws = functionRegion ? VERCEL_TO_AWS[functionRegion] ?? null : null;
  const regionMatch = functionAws && dbRegion ? (functionAws === dbRegion ? "match" : "mismatch") : "unknown";
  return {
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    vercelEnv: process.env.VERCEL_ENV ?? null,
    functionRegion,
    functionAws,
    dbHost,
    dbRegion,
    regionMatch,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    next: pkg.dependencies.next,
    prisma: Prisma.prismaVersion.client,
    devEmailsSet: !!process.env.DEV_EMAILS?.trim(),
    dbParams: {
      pgbouncer: params.get("pgbouncer") === "true",
      connectTimeout: params.get("connect_timeout"),
      poolTimeout: params.get("pool_timeout"),
      connectionLimit: params.get("connection_limit"),
    },
  };
}

export type Ping = { ok: true; runs: number[]; min: number; median: number; max: number } | { ok: false; error: string; ms: number };

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

/** Round-trip time to the database: `SELECT 1`, five times in a row. */
export async function pingDb(times = 5): Promise<Ping> {
  const runs: number[] = [];
  const started = Date.now();
  try {
    for (let i = 0; i < times; i++) {
      const t = performance.now();
      await prisma.$queryRaw`SELECT 1`;
      runs.push(Math.round(performance.now() - t));
    }
    return { ok: true, runs, min: Math.min(...runs), median: median(runs), max: Math.max(...runs) };
  } catch (err) {
    const message = err instanceof Error ? err.message.split("\n").filter(Boolean).slice(-1)[0] ?? err.message : String(err);
    return { ok: false, error: message.slice(0, 300), ms: Date.now() - started };
  }
}

export async function rowCounts() {
  const [users, categories, products, variants, movements, orders, orderItems, statusEvents] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.stockMovement.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.orderStatusEvent.count(),
  ]);
  return [
    { model: "User", n: users },
    { model: "Category", n: categories },
    { model: "Product", n: products },
    { model: "ProductVariant", n: variants },
    { model: "StockMovement", n: movements },
    { model: "Order", n: orders },
    { model: "OrderItem", n: orderItems },
    { model: "OrderStatusEvent", n: statusEvents },
  ];
}
