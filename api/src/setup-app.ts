import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import express, { type NextFunction, type Request, type Response } from 'express';
import { join } from 'node:path';
import helmet from 'helmet';
import { AUTH, AUTH_BASE_PATH, CLIENT_IP_HEADER, type Auth } from './auth/auth.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import type { Env } from './config/env.js';
import { LOCAL_UPLOAD_PATH, LocalStorage } from './media/local-storage.js';
import { StorageService } from './media/storage.service.js';
import { MAX_PHOTO_BYTES } from './media/uploads.service.js';

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

  const storage = app.get(StorageService);
  if (storage instanceof LocalStorage) setupLocalStorage(app, storage);

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

/**
 * Development stand-ins for R2: accept signed uploads (PUT) and serve
 * processed photos. Only listings/ is served; incoming/ originals (which can
 * hold GPS data) stay private, as they are in R2.
 */
function setupLocalStorage(app: NestExpressApplication, storage: LocalStorage) {
  app.use(
    LOCAL_UPLOAD_PATH,
    express.raw({ type: () => true, limit: MAX_PHOTO_BYTES }),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'PUT') return next();
      const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
      const key = storage.verifyUpload(req.query, req.headers['content-type'], body.length);
      if (!key) {
        res.status(403).json({ error: { code: 'INVALID_UPLOAD_URL', message: 'This upload link is invalid or has expired' } });
        return;
      }
      storage.put(key, body).then(() => res.status(200).end(), next);
    },
  );
  app.useStaticAssets(join(storage.root, 'listings'), {
    prefix: '/media/listings/',
    immutable: true,
    maxAge: '365d',
    // Let the web app (another origin) show these images.
    setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
  });
}
