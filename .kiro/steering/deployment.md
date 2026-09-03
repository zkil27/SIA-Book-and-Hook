---
inclusion: manual
---

# Deployment Reference (Supabase + Vercel)

Pull this in with `#deployment` when doing deploy/DB-infra work. Full runbook:
#[[file:docs/deployment.md]]. Env template: #[[file:.env.example]].

## Two connection strings (the #1 time sink)

| Var | String | Port | Used for |
|---|---|---|---|
| `DATABASE_URL` | transaction pooler + `?pgbouncer=true` | 6543 | app runtime |
| `DIRECT_URL` | direct connection | 5432 | `prisma migrate` only |

Migrations cannot run through the pooler. Set BOTH locally (`.env.local`) and in
Vercel env vars for all environments. `schema.prisma` already declares both.

## Vercel build

`package.json` must be:
```json
"scripts": {
  "build": "prisma generate && next build",
  "postinstall": "prisma generate"
}
```
Otherwise the cached Prisma client goes stale → cryptic "missing client" build
failure. (Current repo has plain `next build` and a leftover
`prisma skills sync` postinstall — fix when touching deploy.)

## First migration + seed

```
npx prisma migrate dev --name init
npx prisma db seed
```
Verify rows exist in the Supabase table editor; console output alone has burned
people. There are NO backups on the free tier — `prisma/seed.ts` IS the backup,
so commit it and keep it reproducible.

## Keep-alive cron (Supabase pauses free projects after ~7 idle days)

- `app/api/keep-alive/route.ts` running one trivial Prisma query, with
  `export const dynamic = "force-dynamic"`.
- `vercel.json`: `{ "crons": [{ "path": "/api/keep-alive", "schedule": "0 3 * * *" }] }`

## Troubleshooting

| Symptom | Cause |
|---|---|
| Migration hangs/errors on connect | pooled string used for migrations — check `DIRECT_URL` |
| Build fails, missing Prisma client | `prisma generate` not in build script |
| Works locally, empty on Vercel | env vars unset in Vercel / wrong environment |
| "Too many connections" | a `new PrismaClient()` outside `lib/prisma.ts` |
| Everything times out, dashboard "paused" | restore project, wait for Active |

Free tier: 500 MB DB, 5 GB egress, 2 active projects, no backups.
