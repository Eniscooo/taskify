import { z } from 'zod';

/**
 * Environment contract. The app refuses to boot if anything is missing or
 * malformed, so misconfiguration fails fast instead of at first request.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((v) => v.split(',').map((o) => o.trim()).filter(Boolean)),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  REDIS_URL: z.url({ protocol: /^rediss?$/ }),
  /** Public base URL for uploaded media: the CDN in production, the API's /media route locally. */
  MEDIA_BASE_URL: z.url().default('http://localhost:4000/media'),
  /**
   * Where uploaded photos are stored. "r2" is Cloudflare R2 (production).
   * "local" writes to MEDIA_DIR, serves files at /media and imitates R2's
   * signed upload URLs, for development without R2 credentials.
   */
  MEDIA_STORAGE: z.enum(['local', 'r2']).default('local'),
  MEDIA_DIR: z.string().default('.data/media'),
  /** Cloudflare R2. The keys stay on the server; browsers only get short-lived signed URLs. */
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),

  /** Signs session cookies. Generate with `openssl rand -base64 32`. */
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'must be at least 32 characters')
    .refine((s) => !s.startsWith('replace-with'), 'replace the placeholder from .env.example'),
  /** Public origin of this API, e.g. https://api.naijamarket.ng. */
  BETTER_AUTH_URL: z.url(),
  /**
   * Parent domain for the session cookie (e.g. "naijamarket.ng") so the web
   * app on naijamarket.ng can read it. Leave unset for localhost.
   */
  COOKIE_DOMAIN: z.string().optional(),
  /**
   * How OTP codes are delivered. "console" logs them and is for development
   * only; a real SMS provider is required in production.
   */
  SMS_PROVIDER: z.enum(['console']).default('console'),
  /**
   * How emails are sent. "console" logs them (development only); "resend"
   * sends them through Resend and needs RESEND_API_KEY and EMAIL_FROM.
   */
  EMAIL_PROVIDER: z.enum(['console', 'resend']).default('console'),
  RESEND_API_KEY: z.string().optional(),
  /** Sender, e.g. "Naija Market <no-reply@naijamarket.ng>". The domain must be verified in Resend. */
  EMAIL_FROM: z.string().optional(),
  /** Number of reverse proxies in front of the API, so client IPs are read correctly. */
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(0),
})
  .refine((env) => env.NODE_ENV !== 'production' || env.SMS_PROVIDER !== 'console', {
    path: ['SMS_PROVIDER'],
    message: 'a real SMS provider is required in production',
  })
  .refine((env) => env.NODE_ENV !== 'production' || env.MEDIA_STORAGE !== 'local', {
    path: ['MEDIA_STORAGE'],
    message: 'object storage is required in production',
  })
  .refine(
    (env) =>
      env.MEDIA_STORAGE !== 'r2' ||
      (env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET),
    { path: ['MEDIA_STORAGE'], message: 'r2 needs R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET' },
  )
  .refine((env) => env.NODE_ENV !== 'production' || env.EMAIL_PROVIDER !== 'console', {
    path: ['EMAIL_PROVIDER'],
    message: 'a real email provider is required in production',
  })
  .refine((env) => env.EMAIL_PROVIDER !== 'resend' || (env.RESEND_API_KEY && env.EMAIL_FROM), {
    path: ['EMAIL_PROVIDER'],
    message: 'resend needs RESEND_API_KEY and EMAIL_FROM',
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}
