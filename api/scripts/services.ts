/**
 * Runs local Postgres and Redis for development without Docker.
 * Data persists in .data/ between runs. Press Ctrl+C to stop both.
 *
 * Usage: npm run services
 */
import "dotenv/config";
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import { POSTGRES_DATA_DIR, REDIS_DATA_DIR, REDIS_DIR } from "./paths.js";

const dbUrl = new URL(process.env.DATABASE_URL ?? "");
const redisUrl = new URL(process.env.REDIS_URL ?? "redis://localhost:6379");
const dbName = dbUrl.pathname.slice(1);

async function startPostgres() {
  const pg = new EmbeddedPostgres({
    databaseDir: POSTGRES_DATA_DIR,
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    port: Number(dbUrl.port || 5432),
    persistent: true,
    // Windows initdb defaults to WIN1252, which can't store "₦". Force UTF-8
    // with the C locale so behaviour is identical on every machine.
    initdbFlags: ["--encoding=UTF8", "--no-locale"],
    onLog: () => {},
    onError: (e) => console.error("[postgres]", e),
  });

  const fresh = !existsSync(join(POSTGRES_DATA_DIR, "PG_VERSION"));
  if (fresh) {
    console.log("[postgres] initialising data directory…");
    await pg.initialise();
  }
  await pg.start();
  if (fresh) await pg.createDatabase(dbName);
  console.log(`[postgres] ready on port ${dbUrl.port || 5432}, database "${dbName}"`);
  return pg;
}

function startRedis(): ChildProcess {
  const exe = resolve(REDIS_DIR, process.platform === "win32" ? "redis-server.exe" : "redis-server");
  if (!existsSync(exe)) {
    throw new Error("Redis not found. Run `npm run setup:tools` first.");
  }
  mkdirSync(REDIS_DATA_DIR, { recursive: true });
  const redis = spawn(
    exe,
    ["--port", redisUrl.port || "6379", "--bind", "127.0.0.1", "--dir", resolve(REDIS_DATA_DIR), "--appendonly", "yes", "--save", ""],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  redis.stdout?.on("data", (d: Buffer) => {
    if (d.toString().includes("Ready to accept connections")) {
      console.log(`[redis] ready on port ${redisUrl.port || 6379}`);
    }
  });
  redis.stderr?.on("data", (d: Buffer) => console.error("[redis]", d.toString().trim()));
  redis.on("exit", (code) => code && console.error(`[redis] exited with code ${code}`));
  return redis;
}

const redis = startRedis();
const pg = await startPostgres();
console.log("Services running. Press Ctrl+C to stop.");

let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  console.log("\nStopping services…");
  redis.kill();
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
