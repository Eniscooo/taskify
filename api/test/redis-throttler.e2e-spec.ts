import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { RedisThrottlerStorage } from '../src/redis/redis-throttler.storage.js';
import { RedisService } from '../src/redis/redis.service.js';

describe('RedisThrottlerStorage', () => {
  const redis = new RedisService({ get: () => process.env.REDIS_URL } as unknown as ConfigService<never, true>);
  const storage = new RedisThrottlerStorage(redis);
  const key = `test-${Date.now()}`;

  afterAll(async () => {
    await redis.del(`throttle:t:${key}:hits`, `throttle:t:${key}:block`);
    await redis.quit();
  });

  it('counts hits and blocks once the limit is exceeded', async () => {
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await storage.increment(key, 10_000, 3, 5_000, 't'));

    expect(results.map((r) => r.totalHits)).toEqual([1, 2, 3, 4]);
    expect(results.slice(0, 3).every((r) => !r.isBlocked)).toBe(true);
    expect(results[3]).toMatchObject({ isBlocked: true, timeToBlockExpire: 5 });
    expect(results[0]!.timeToExpire).toBeLessThanOrEqual(10);

    // While blocked, further hits are not counted.
    const blocked = await storage.increment(key, 10_000, 3, 5_000, 't');
    expect(blocked).toMatchObject({ isBlocked: true, totalHits: 4 });
  });
});
