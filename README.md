# My Year of Grace 2026

A Next.js gratitude archive where people share free testimonies on a 2026 calendar and optionally lock one into the Grace Archive via Paystack.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma 7
- Paystack, Cloudinary, Resend, PostHog

## Setup

1. Copy `.env.example` to `.env` and fill in values.
2. **Supabase database** — see [Supabase connection](#supabase-connection) below.
3. Push schema and seed:

```bash
npm install
npx prisma db push
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

## Supabase connection

Supabase’s **direct** host (`db.[ref].supabase.co:5432`) is **IPv6-only**. Many local networks and tools cannot reach it, which causes:

`P1001: Can't reach database server at db.xxx.supabase.co`

**Fix:** use the **pooler** connection string from Supabase Dashboard → **Project Settings → Database → Connect**.

| Use case                | Supabase mode          | Port               | User format              |
| ----------------------- | ---------------------- | ------------------ | ------------------------ |
| Vercel / production app | **Transaction pooler** | 6543               | `postgres.[project-ref]` |
| Local `db push` / seed  | **Session pooler**     | 5432 (pooler host) | `postgres.[project-ref]` |

Use **two env vars** in local `.env`:

```
DIRECT_DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

`prisma7.config.ts` uses `DIRECT_DATABASE_URL` for `db push`. **Do not run `db push` on port 6543** — it hangs.

**Vercel env:** set only `DATABASE_URL` (6543 transaction pooler).

Also check in Supabase: **Project is not paused** (free tier pauses after inactivity → click **Restore**).

## Key routes

- `/` — homepage with live stats and 2026 calendar
- `/share` — submit a testimony
- `/t/[publicId]` — public testimony page
- `/archive` — locked Grace Archive
- `/[slug]` — locked custom URL
- `/admin` — moderation dashboard (env credentials)

## Admin

Sign in at `/admin/login` using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

## Payments

Paystack checkout is initialized server-side. Final lock assignment happens only after webhook/server verification in `/api/paystack/webhook` and `/api/paystack/verify`.
