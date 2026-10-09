import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

/** Load-balancer / uptime probe. Returns 503 if a dependency is down. */
@Public()
@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @ApiOkResponse({ schema: { example: { status: 'ok', database: 'up', redis: 'up' } } })
  @ApiServiceUnavailableResponse()
  async check() {
    const [database, redis] = await Promise.all([
      this.prisma.$queryRaw`SELECT 1`.then(() => 'up' as const).catch(() => 'down' as const),
      this.redis.ping().then(() => 'up' as const).catch(() => 'down' as const),
    ]);
    const body = { status: database === 'up' && redis === 'up' ? 'ok' : 'degraded', database, redis };
    if (body.status !== 'ok') {
      throw new ServiceUnavailableException({ code: 'UNHEALTHY', message: 'A dependency is down', details: body });
    }
    return body;
  }
}
