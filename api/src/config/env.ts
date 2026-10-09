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
  /** Public CDN base for uploaded media (Cloudflare R2 behind a custom domain). */
  MEDIA_BASE_URL: z.url().default('https://media.naijamarket.ng'),

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
  /** Number of reverse proxies in front of the API, so client IPs are read correctly. */
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(0),
}).refine((env) => env.NODE_ENV !== 'production' || env.SMS_PROVIDER !== 'console', {
  path: ['SMS_PROVIDER'],
  message: 'a real SMS provider is required in production',
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
