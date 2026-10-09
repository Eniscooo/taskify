import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CategoriesModule } from './categories/categories.module.js';
import { validateEnv } from './config/env.js';
import { HealthModule } from './health/health.module.js';
import { ListingsModule } from './listings/listings.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RedisThrottlerStorage } from './redis/redis-throttler.storage.js';
import { RedisModule } from './redis/redis.module.js';

/**
 * Modular monolith root. Each business area (listings, tasks, orders,
 * payments, messaging…) is its own module so it can be extracted later.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    PrismaModule,
    RedisModule,
    ThrottlerModule.forRootAsync({
      inject: [RedisThrottlerStorage],
      useFactory: (storage: RedisThrottlerStorage) => ({
        // Default: 120 requests per minute per client. Tighten per-route
        // (e.g. login, OTP) with @Throttle().
        throttlers: [{ name: 'default', ttl: 60_000, limit: 120 }],
        storage,
      }),
    }),
    HealthModule,
    CategoriesModule,
    ListingsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
