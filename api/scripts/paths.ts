import { join } from "node:path";

/** All local service state lives under the api/ folder and is gitignored. */
export const TOOLS_DIR = ".tools";
export const REDIS_DIR = join(TOOLS_DIR, "redis-8.10.2");
export const DATA_DIR = ".data";
export const POSTGRES_DATA_DIR = join(DATA_DIR, "postgres");
export const REDIS_DATA_DIR = join(DATA_DIR, "redis");
