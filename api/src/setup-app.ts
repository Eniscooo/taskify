import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { AUTH, AUTH_BASE_PATH, CLIENT_IP_HEADER, type Auth } from './auth/auth.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import type { Env } from './config/env.js';

export const API_PREFIX = 'v1';

/**
 * HTTP conventions shared by main.ts and the e2e tests, so tests exercise
 * exactly what production runs. The app must be created with
 * `bodyParser: false` so Better Auth can read raw auth request bodies.
 */
export function setupApp(app: NestExpressApplication) {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  const trustProxyHops = config.get('TRUST_PROXY_HOPS', { infer: true });
  if (trustProxyHops > 0) app.set('trust proxy', trustProxyHops);

  app.setGlobalPrefix(API_PREFIX);
  app.use(helmet());
  app.enableCors({ origin: config.get('CORS_ORIGINS', { infer: true }), credentials: true });
  app.enableShutdownHooks();

  // Better Auth handles /v1/auth/* itself (sign-up, sign-in, OTP, sessions).
  // It runs before the JSON body parser, which would otherwise consume the body.
  const authHandler = toNodeHandler(app.get<Auth>(AUTH));
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.originalUrl.startsWith(`${AUTH_BASE_PATH}/`)) return next();
    req.headers[CLIENT_IP_HEADER] = req.ip;
    authHandler(req, res).catch(next);
  });
  app.useBodyParser('json');
  app.useBodyParser('urlencoded', { extended: true });

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
        .setDescription(
          'REST API for the Naija Market web and mobile apps. Sign-in and sessions are handled by Better Auth under ' +
            `\`${AUTH_BASE_PATH}/*\`; those routes are not listed here.`,
        )
        .setVersion('1')
        .addCookieAuth('nm.session_token')
        .build(),
    );
    SwaggerModule.setup('docs', app, doc);
  }
}
