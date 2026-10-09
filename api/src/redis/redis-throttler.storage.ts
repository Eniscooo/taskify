import { Injectable } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from './redis.service.js';

/**
 * Atomically counts a hit and applies blocking. Keys:
 *   KEYS[1] hit counter, KEYS[2] block flag. ARGV: ttl ms, limit, block ms.
 * Returns { hits, hitTtlMs, blocked (0/1), blockTtlMs }.
 */
const INCREMENT_SCRIPT = `
local blockTtl = redis.call('PTTL', KEYS[2])
if blockTtl > 0 then
  return { tonumber(redis.call('GET', KEYS[1]) or '0'), redis.call('PTTL', KEYS[1]), 1, blockTtl }
end
local hits = redis.call('INCR', KEYS[1])
if hits == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
local hitTtl = redis.call('PTTL', KEYS[1])
if hits > tonumber(ARGV[2]) then
  redis.call('SET', KEYS[2], '1', 'PX', ARGV[3])
  return { hits, hitTtl, 1, tonumber(ARGV[3]) }
end
return { hits, hitTtl, 0, 0 }
`;

/**
 * Rate-limit storage shared by every API instance, so limits hold when the
 * API runs behind a load balancer (the in-memory default would not).
 */
@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: RedisService) {}

  async increment(key: string, ttl: number, limit: number, blockDuration: number, throttlerName: string) {
    const base = `throttle:${throttlerName}:${key}`;
    const [hits, hitTtlMs, blocked, blockTtlMs] = (await this.redis.eval(
      INCREMENT_SCRIPT,
      2,
      `${base}:hits`,
      `${base}:block`,
      ttl,
      limit,
      blockDuration,
    )) as [number, number, number, number];

    return {
      totalHits: hits,
      timeToExpire: Math.max(0, Math.ceil(hitTtlMs / 1000)),
      isBlocked: blocked === 1,
      timeToBlockExpire: Math.max(0, Math.ceil(blockTtlMs / 1000)),
    };
  }
}
