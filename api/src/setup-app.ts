import { BadRequestException, ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import type { Env } from './config/env.js';

export const API_PREFIX = 'v1';

/**
 * HTTP conventions shared by main.ts and the e2e tests, so tests exercise
 * exactly what production runs.
 */
export function setupApp(app: INestApplication) {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.setGlobalPrefix(API_PREFIX);
  app.use(helmet());
  app.enableCors({ origin: config.get('CORS_ORIGINS', { infer: true }), credentials: true });
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          code: 'VALIDATION_FAILED',
          message: 'Some fields are invalid',
          details: errors.map((e) => ({ field: e.property, problems: Object.values(e.constraints ?? {}) })),
        }),
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    const doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Naija Market API')
        .setDescription('REST API for the Naija Market web and mobile apps')
        .setVersion('1')
        .build(),
    );
    SwaggerModule.setup('docs', app, doc);
  }
}
