# My Year of Grace 2026

A Next.js gratitude archive where people share free testimonies on a 2026 calendar and optionally lock one into the Grace Archive via Paystack.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma 7
- Paystack, Cloudinary, Resend, PostHog

## Setup

1. Copy `.env.example` to `.env` and fill in values.
2. Start Postgres (or run `npx prisma dev` for local Prisma Postgres).
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
