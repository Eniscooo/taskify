import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import type { Env } from '../config/env.js';

/** Shared Redis connection (cache, rate limits; queues and chat presence later). */
@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(config: ConfigService<Env, true>) {
    super(config.get('REDIS_URL', { infer: true }), { maxRetriesPerRequest: 3 });
    this.on('error', (err) => this.logger.error(`Redis error: ${err.message}`));
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
