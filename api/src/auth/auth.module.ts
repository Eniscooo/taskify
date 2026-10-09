import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { SmsService } from '../sms/sms.service.js';
import { AUTH, createAuth } from './auth.js';
import { SessionGuard } from './session.guard.js';

@Global()
@Module({
  providers: [
    {
      provide: AUTH,
      inject: [ConfigService, PrismaService, RedisService, SmsService],
      useFactory: (config: ConfigService<Env, true>, prisma: PrismaService, redis: RedisService, sms: SmsService) =>
        createAuth({
          env: {
            NODE_ENV: config.get('NODE_ENV', { infer: true }),
            CORS_ORIGINS: config.get('CORS_ORIGINS', { infer: true }),
            BETTER_AUTH_SECRET: config.get('BETTER_AUTH_SECRET', { infer: true }),
            BETTER_AUTH_URL: config.get('BETTER_AUTH_URL', { infer: true }),
            COOKIE_DOMAIN: config.get('COOKIE_DOMAIN', { infer: true }),
          },
          prisma,
          redis,
          sms,
        }),
    },
    SessionGuard,
  ],
  exports: [AUTH, SessionGuard],
})
export class AuthModule {}
