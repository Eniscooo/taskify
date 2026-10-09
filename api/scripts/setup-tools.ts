/**
 * Downloads the Windows Redis build into .tools/ (gitignored) and verifies
 * its SHA-256 before extracting. Postgres needs no download: it ships in the
 * `embedded-postgres` npm package.
 *
 * Usage: npm run setup:tools
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { REDIS_DIR, TOOLS_DIR } from "./paths.js";

const REDIS_VERSION = "8.10.2";
const REDIS_ASSET = `Redis-${REDIS_VERSION}-Windows-x64-msys2`;
const REDIS_URL = `https://github.com/redis-windows/redis-windows/releases/download/${REDIS_VERSION}/${REDIS_ASSET}.zip`;
const REDIS_SHA256 = "7c8cebd50347eaa1d9e784da842ed47a4f33394637835531d6614777b950ee85";

async function setupRedis() {
  if (process.platform !== "win32") {
    console.log("Not on Windows: install Redis with your package manager or use docker-compose.yml.");
    return;
  }
  if (existsSync(join(REDIS_DIR, "redis-server.exe"))) {
    console.log(`Redis ${REDIS_VERSION} already installed in ${REDIS_DIR}`);
    return;
  }

  console.log(`Downloading Redis ${REDIS_VERSION}…`);
  const res = await fetch(REDIS_URL);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const zip = Buffer.from(await res.arrayBuffer());

  const digest = createHash("sha256").update(zip).digest("hex");
  if (digest !== REDIS_SHA256) {
    throw new Error(`Checksum mismatch for Redis download (got ${digest}). Aborting.`);
  }

  // Extract into an empty temp dir, then move the single folder into place.
  const staging = mkdtempSync(join(tmpdir(), "naija-redis-"));
  try {
    const zipPath = join(staging, "redis.zip");
    writeFileSync(zipPath, zip);
    execFileSync("tar", ["-xf", zipPath, "-C", staging]);
    mkdirSync(TOOLS_DIR, { recursive: true });
    renameSync(join(staging, REDIS_ASSET), REDIS_DIR);
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
  console.log(`Redis installed in ${REDIS_DIR} (sha256 verified)`);
}

await setupRedis();
console.log("Postgres needs no download: binaries come from the embedded-postgres package.");
