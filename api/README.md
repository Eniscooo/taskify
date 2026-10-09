# Naija Market API

NestJS 12 modular monolith with PostgreSQL 18 (Prisma 7), Redis 8 and Better Auth. It's the backend for the web app one folder up.

## First-time setup

```bash
cd api
npm install                 # also generates the Prisma client
cp .env.example .env        # then set BETTER_AUTH_SECRET (openssl rand -base64 32)
npm run setup:tools         # downloads Redis for Windows into .tools/ (checksum-verified)
```

## Daily development

Use two terminals:

```bash
npm run services            # terminal 1: Postgres :5432 + Redis :6379 (Ctrl+C stops both)
npm run start:dev           # terminal 2: API on http://localhost:4000/v1, docs at /docs
```

On a fresh database, run these once while the services are up:

```bash
npm run db:deploy           # apply migrations
npm run db:seed             # load the web app's mock users and listings
```

Seeded users sign in with the password `naija1234`. SMS codes are printed in the `start:dev` terminal.

If you have Docker, `docker compose up -d` replaces `npm run services`. It also includes PostGIS.

Postgres data lives in `.data/`. Delete `.data/postgres` for a clean database.

## Scripts

| Script | What it does |
|---|---|
| `npm run services` | Local Postgres + Redis without Docker |
| `npm run start:dev` | API with hot reload |
| `npm run db:migrate` | Create and apply a migration after editing `prisma/schema.prisma` |
| `npm run db:deploy` | Apply existing migrations (CI and production) |
| `npm run db:seed` | Seed dev data (safe to re-run) |
| `npm run db:studio` | Browse the database in Prisma Studio |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests (needs `services` running and the seed) |
| `npm run lint` / `npm run typecheck` | oxlint / tsc |

## API conventions

- **Base path:** `/v1`.
- **Interactive docs:** `/docs`, served outside production only.
- **Money:**
  - The API sends and receives whole naira (`price: 385000`).
  - The database stores BigInt kobo (`price_kobo`), the same unit Paystack uses.
- **Lists** are cursor-paginated:
  - Responses look like `{ items, nextCursor }`.
  - Pass `?cursor=<nextCursor>` to get the next page. `nextCursor` is `null` on the last page.
- **Errors** always have this shape (except `/v1/auth/*`, see Authentication):

  ```json
  { "error": { "code": "VALIDATION_FAILED", "message": "Some fields are invalid", "details": [...] } }
  ```

  - Clients branch on `code` and show `message` to the user.
  - Unexpected errors return a generic message. Details go to the server log only.
- **Validation:** request input is validated with class-validator. Unknown fields are rejected.
- **Rate limiting:**
  - The default is 120 requests per minute per client.
  - Counters live in Redis, so limits still hold when several API instances run behind a load balancer.
  - Use `@Throttle()` to tighten limits on sensitive routes (login, OTP).
- **Statelessness:** no state is kept in memory between requests, so the API can scale horizontally.
- **Authentication:** every route needs a session unless it's marked `@Public()`. See Authentication below.
- **Search:**
  - Postgres full-text search uses a GIN index (see the `listing_full_text_search` migration). There's no `LIKE '%…%'`.
  - OpenSearch comes later.

## Structure

```text
src/
├── main.ts / setup-app.ts   bootstrap + HTTP conventions (shared with e2e tests)
├── config/env.ts            zod-validated environment (app won't boot if invalid)
├── common/                  error filter, money, pagination
├── prisma/                  PrismaService (global)
├── redis/                   RedisService + Redis rate-limit storage (global)
├── auth/                    Better Auth config, SessionGuard, @Public(), @CurrentUser()
├── sms/                     SmsService (logs to the console for now)
├── users/                   GET /v1/me
├── health/                  GET /v1/health (db + redis)
├── categories/              GET /v1/categories
└── listings/                GET /v1/listings, GET /v1/listings/:id
```

Following the build plan, these modules come next, each with its own migration: tasks and providers, messaging, orders, payments and ledger, reviews, notifications, disputes and admin.

## Endpoints so far

| Method | Path | Notes |
|---|---|---|
| GET | `/v1/health` | 200 `{status:"ok"}` or 503 if Postgres or Redis is down |
| GET | `/v1/me` | The signed-in user. 401 when signed out |
| GET | `/v1/categories` | Listing categories |
| GET | `/v1/listings` | Filters: `q`, `category`, `area`, `seller` (username), `minPrice`, `maxPrice`, `condition`, `delivery`, `sort`, `cursor`, `limit` |
| * | `/v1/auth/*` | Better Auth, see below |

## Authentication

[Better Auth](https://better-auth.com) is mounted at `/v1/auth/*` (see `src/auth/auth.ts`). The web app talks to it with the Better Auth client.

**Phone-first flow**

1. `POST /v1/auth/sign-up/email` with `name`, `email`, `password` and `phoneNumber` (E.164, e.g. `+2348034127790`). This creates the account but no session.
2. `POST /v1/auth/phone-number/send-otp`, then `POST /v1/auth/phone-number/verify` with the 6-digit code. Verifying signs the user in.
3. Later sign-ins use `POST /v1/auth/sign-in/phone-number` or `/sign-in/email` with the password.
4. Password reset: `POST /v1/auth/phone-number/request-password-reset`, then `/phone-number/reset-password` with the code and new password. This signs out every other session.

**Rules**

- Nobody gets a session until their phone is verified. Signing in with an unverified phone returns 403 `PHONE_NOT_VERIFIED` (with `phoneNumber`) and texts a code.
- Suspended users can't sign in (403 `ACCOUNT_SUSPENDED`).
- Codes are only texted to numbers that belong to an account awaiting verification. This stops the public endpoint from being used to send SMS to anyone.
- A verified phone number can't be used for a second account. An unverified sign-up doesn't keep the number reserved.
- Usernames are generated from the name, e.g. `adaeze.o`.

**Sessions**

- The session lives in an httpOnly `nm.session_token` cookie for 30 days. It's stored in Postgres and cached in Redis.
- In production, set `COOKIE_DOMAIN` (e.g. `naijamarket.ng`) so the web app can send the cookie.
- Only origins in `CORS_ORIGINS` can call auth routes (CSRF protection).

**Rate limits**

- Better Auth rate-limits by client IP, with counters in Redis: 5 sign-ins, 3 sign-ups and 3 code requests per minute.
- Behind a load balancer, set `TRUST_PROXY_HOPS` so the real client IP is used.
- Rate limits are off when `NODE_ENV=test`.

**Errors** from `/v1/auth/*` come from Better Auth and look like `{ "code": "INVALID_OTP", "message": "Invalid OTP" }`, not the `{ error: {...} }` envelope.

**In route handlers**, every route needs a session by default. Use `@Public()` for open routes and `@CurrentUser()` to get the signed-in user.
| GET | `/v1/listings/:id` | Active or sold listings only |

## Not set up yet

- **SMS provider:** codes are only logged (`SMS_PROVIDER=console`). The API refuses to start in production until a real provider (e.g. Termii) is added to `SmsService`.
- **Email:** there's no email provider yet, so emails aren't verified and password reset is by SMS only.
- **Changing phone or email:** not supported yet.
- **Roles:** there are no admin roles yet. The web app's `/admin` pages only require a sign-in.

- **PostGIS:** not installed locally, to save disk space. Listings store latitude/longitude, ready for when radius search is added.
- **Photos:** seeded listings point at placeholder R2 keys. Uploads come with the media module.
