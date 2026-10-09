# Naija Market API

NestJS 12 modular monolith with PostgreSQL 18 (Prisma 7) and Redis 8. It's the backend for the web app one folder up.

## First-time setup

```bash
cd api
npm install                 # also generates the Prisma client
cp .env.example .env
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
- **Errors** always have this shape:

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
├── health/                  GET /v1/health (db + redis)
├── categories/              GET /v1/categories
└── listings/                GET /v1/listings, GET /v1/listings/:id
```

Following the build plan, these modules come next, each with its own migration: auth, users, tasks and providers, messaging, orders, payments and ledger, reviews, notifications, disputes and admin.

## Endpoints so far

| Method | Path | Notes |
|---|---|---|
| GET | `/v1/health` | 200 `{status:"ok"}` or 503 if Postgres or Redis is down |
| GET | `/v1/categories` | Listing categories |
| GET | `/v1/listings` | Filters: `q`, `category`, `area`, `minPrice`, `maxPrice`, `condition`, `delivery`, `sort`, `cursor`, `limit` |
| GET | `/v1/listings/:id` | Active or sold listings only |

## Not set up yet

- **PostGIS:** not installed locally, to save disk space. Listings store latitude/longitude, ready for when radius search is added.
- **Photos:** seeded listings point at placeholder R2 keys. Uploads come with the media module.
