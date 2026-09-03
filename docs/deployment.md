# Deployment Runbook — Supabase + Vercel

Do this on Day 3–4, with an empty app. The point is to have deployment already
solved before there's anything worth breaking.

---

## 1. Supabase project

1. Create a Supabase account (no credit card needed) and a new project.
2. Set a database password and **save it somewhere the team can reach** — you
   cannot recover it, only reset it.
3. Choose the region closest to you (Singapore for PH).
4. Wait for the project to finish provisioning before doing anything else.

You get two active free projects. **Use one.** Don't burn the second on
experiments — delete throwaways rather than leaving them active.

## 2. The two connection strings

This is where teams lose a day. Prisma needs both, and they are different.

In the Supabase dashboard: **Connect** (or Project Settings → Database) →
Connection string → URI. You'll see pooled and direct options.

| Variable | Which string | Port | Used for |
|---|---|---|---|
| `DATABASE_URL` | Transaction pooler, with `?pgbouncer=true` appended | 6543 | The app at runtime |
| `DIRECT_URL` | Direct connection | 5432 | Migrations only |

Migrations **cannot** run through the pooler. If you use only the pooled string,
`prisma migrate` fails with an error that reads like a Prisma bug but is a
connection-routing problem.

`prisma/schema.prisma` must declare both:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Put both in `.env.local` for development **and** in Vercel's environment
variables for deployment. Setting them in only one place is the second most
common way to lose an evening.

## 3. First migration and seed

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

The seed prints the demo account credentials at the end. Save them — the
September 5 demo depends on logging in without fumbling.

Verify in the Supabase table editor that rows actually exist. Trusting the
console output alone has burned people.

## 4. Vercel

1. Import the GitHub repo into Vercel.
2. Add `DATABASE_URL` and `DIRECT_URL` to Environment Variables — all
   environments.
3. **Add `prisma generate` to the build.** Vercel caches dependencies, so the
   Prisma client goes stale and the build fails with a cryptic error about a
   missing client. In `package.json`:

   ```json
   "scripts": {
     "build": "prisma generate && next build",
     "postinstall": "prisma generate"
   }
   ```

4. Deploy. Open the live URL. Confirm it renders real rows from the database,
   not just a page that builds.

## 5. Keep-alive cron

Supabase pauses free projects after about 7 days of low database activity. During
the sprint you'll be querying constantly, so it's not a risk now — it's a risk
over a semester break, when you return to a final defense and find the project
offline. Data survives, but it needs a manual restore from the dashboard, which
is not a thing to discover an hour before a panel.

Set it up now:

1. An API route, e.g. `app/api/keep-alive/route.ts`, running one trivial query
   through Prisma.
2. `export const dynamic = "force-dynamic"` so it isn't statically optimized or
   cached — a cached response never touches the database and defeats the point.
3. `vercel.json` with a daily cron hitting it:

   ```json
   {
     "crons": [{ "path": "/api/keep-alive", "schedule": "0 3 * * *" }]
   }
   ```

Free Vercel accounts allow limited cron jobs — one daily job is enough.

---

## When something breaks

| Symptom | Cause |
|---|---|
| Migration hangs or errors on connect | Using the pooled string for migrations. Check `DIRECT_URL`. |
| Build fails, missing Prisma client | `prisma generate` not in the build script. |
| Works locally, empty on Vercel | Env vars not set in Vercel, or set for the wrong environment. |
| "Too many connections" | A `new PrismaClient()` outside `lib/db.ts`. |
| Everything times out, dashboard says paused | Project paused. Restore from the dashboard, wait for **Active**, then query. |
| 402 responses across the project | A free-tier usage limit was crossed — check egress in the dashboard. |

## Free tier limits worth knowing

500 MB database, 1 GB file storage, 5 GB egress, 2 active projects, no backups.
A catalog of 50 products uses a rounding error of the 500 MB. Since there are no
backups on the free tier, commit `prisma/seed.ts` religiously — it *is* your
backup. Anything you can't reproduce by re-running the seed is data you're
willing to lose.
