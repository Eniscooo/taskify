# Naija Market

A Lagos marketplace for buying and selling items and hiring local help, with payments held until the buyer confirms.

- **Web app** (this folder): Next.js 16 with Cache Components, React 19 and Tailwind 4.
- **API** ([api/](api/)): NestJS, PostgreSQL, Redis and Better Auth. See [api/README.md](api/README.md).

## Running locally

Start the API first. Its README covers first-time setup. You need three terminals:

```bash
cd api && npm run services     # Postgres + Redis
cd api && npm run start:dev    # API on http://localhost:4000
npm run dev                    # web app on http://localhost:3000
```

Copy `.env.example` to `.env.local` if the API isn't on `http://localhost:4000/v1`. `next build` also needs the API running, because it prerenders listing pages.

### Signing in

Every seeded user has the password `naija1234`. The demo user is Adaeze: sign in with `0803 412 7790` or `adaeze.okafor@gmail.com`.

New accounts get a 6-digit SMS code. In development, SMS codes and emails are printed in the API terminal instead of being sent.

## What's real and what's mock

| Area | Source |
|---|---|
| Sign-up, login, phone and email verification, password reset (SMS or email), sessions | API (Better Auth) |
| Your profile details (name, area, bio) | API |
| Listings: browse, search, filters, detail, seller's listings | API |
| Selling: photo uploads, publish, drafts, edit, mark sold, My Listings | API |
| Orders, payments, messages, reviews, notifications, providers, tasks, admin | Mock data in `lib/mock-data.ts` |

Mock data still uses mock ids (`u-me`, `l-1003`). Seeded users keep their mock id in the web app, so Adaeze still sees her demo orders and messages. New accounts start empty.

## Where things live

- `lib/api.ts`: one function per API endpoint. Listings call the API; the rest read mock data.
- `lib/data/listings.ts`: cached listing reads for Server Components.
- `lib/auth-client.ts`: Better Auth client for the browser (sign-in, OTP, session).
- `lib/session.ts`: the signed-in user for Server Components. Read it inside `<Suspense>`.
- `proxy.ts`: sends signed-out visitors to `/auth/login` before private pages.
