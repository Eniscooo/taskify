import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError } from 'better-auth/api';
import { emailOTP } from 'better-auth/plugins/email-otp';
import { phoneNumber } from 'better-auth/plugins/phone-number';
import type { Env } from '../config/env.js';
import type { EmailService } from '../email/email.service.js';
import { codeEmail } from '../email/templates.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { RedisService } from '../redis/redis.service.js';
import type { SmsService } from '../sms/sms.service.js';
import { isNigerianMobile } from './phone.js';
import { uniqueUsername } from './username.js';

/** Injection token for the Better Auth instance. */
export const AUTH = Symbol('AUTH');

/** Better Auth serves every route under this path, e.g. POST /v1/auth/sign-in/email. */
export const AUTH_BASE_PATH = '/v1/auth';

/**
 * Header the auth handler sets from Express's `req.ip` (which honours
 * TRUST_PROXY_HOPS), so Better Auth rate-limits by the real client IP. Any
 * value a client sends is overwritten.
 */
export const CLIENT_IP_HEADER = 'x-naija-client-ip';

const OTP_MINUTES = 5;

export interface AuthDeps {
  env: Pick<Env, 'NODE_ENV' | 'CORS_ORIGINS' | 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL' | 'COOKIE_DOMAIN'>;
  prisma: PrismaService;
  redis: RedisService;
  sms: SmsService;
  email: EmailService;
}

/**
 * Phone-first auth:
 * 1. Sign up with name, phone, email and password. No session yet.
 * 2. Verify the phone with an SMS code. This creates the session.
 * 3. Sign in later with phone or email plus password.
 *
 * Nobody gets a session until their phone is verified (see the session hook).
 */
export function createAuth({ env, prisma, redis, sms, email }: AuthDeps) {
  // Assigned once `auth` exists; the session hook below needs the plugin's endpoint.
  let sendVerificationCode: (phone: string) => Promise<unknown>;

  const auth = betterAuth({
    appName: 'Naija Market',
    baseURL: env.BETTER_AUTH_URL,
    basePath: AUTH_BASE_PATH,
    secret: env.BETTER_AUTH_SECRET,
    // Browser origins allowed to call auth routes (CSRF protection).
    trustedOrigins: env.CORS_ORIGINS,
    // Email codes are for verifying the address and resetting the password
    // only: no passwordless email sign-in, and email changes aren't supported yet.
    disabledPaths: [
      '/sign-in/email-otp',
      '/forget-password/email-otp',
      '/email-otp/request-email-change',
      '/email-otp/change-email',
    ],
    database: prismaAdapter(prisma, { provider: 'postgresql' }),

    // Sessions are stored in Postgres and cached in Redis, so most requests
    // never touch the database. Rate-limit counters live here too.
    secondaryStorage: {
      get: (key) => redis.get(`auth:${key}`),
      getAndDelete: (key) => redis.getdel(`auth:${key}`),
      // INCR and set the TTL only when the key is created, in one atomic step.
      increment: async (key, ttl) =>
        Number(
          await redis.eval(
            "local n = redis.call('INCR', KEYS[1]) if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end return n",
            1,
            `auth:${key}`,
            ttl,
          ),
        ),
      set: async (key, value, ttl) => {
        if (ttl) await redis.set(`auth:${key}`, value, 'EX', ttl);
        else await redis.set(`auth:${key}`, value);
      },
      delete: async (key) => {
        await redis.del(`auth:${key}`);
      },
    },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      // The session is created when the phone is verified, not at sign-up.
      autoSignIn: false,
      revokeSessionsOnPasswordReset: true,
    },

    user: {
      additionalFields: {
        username: { type: 'string', required: false, input: false },
        area: { type: 'string', required: false },
        bio: { type: 'string', required: false },
        status: { type: 'string', required: false, input: false },
        idVerifiedAt: { type: 'date', required: false, input: false },
      },
    },

    session: {
      storeSessionInDatabase: true,
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // extend at most once a day
    },

    rateLimit: {
      // Off in tests, which sign in repeatedly from one IP.
      enabled: env.NODE_ENV !== 'test',
      storage: 'secondary-storage',
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/email': { window: 60, max: 5 },
        '/sign-in/phone-number': { window: 60, max: 5 },
        '/sign-up/email': { window: 60, max: 3 },
        '/phone-number/send-otp': { window: 60, max: 3 },
        '/phone-number/verify': { window: 60, max: 5 },
        '/phone-number/request-password-reset': { window: 60, max: 3 },
        '/phone-number/reset-password': { window: 60, max: 5 },
        '/email-otp/send-verification-otp': { window: 60, max: 3 },
        '/email-otp/verify-email': { window: 60, max: 5 },
        '/email-otp/request-password-reset': { window: 60, max: 3 },
        '/email-otp/reset-password': { window: 60, max: 5 },
      },
    },

    advanced: {
      cookiePrefix: 'nm',
      // Better Auth skips its origin (CSRF) check when NODE_ENV=test; keep it
      // on so the e2e tests exercise the same protection as production.
      disableOriginCheck: false,
      // Let Postgres generate UUIDv7 ids, like every other table.
      database: { generateId: false },
      ipAddress: { ipAddressHeaders: [CLIENT_IP_HEADER] },
      ...(env.COOKIE_DOMAIN && { crossSubDomainCookies: { enabled: true, domain: env.COOKIE_DOMAIN } }),
    },

    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const phone = (user as { phoneNumber?: unknown }).phoneNumber;
            if (typeof phone !== 'string' || !isNigerianMobile(phone)) {
              throw new APIError('BAD_REQUEST', {
                code: 'INVALID_PHONE_NUMBER',
                message: 'Enter a valid Nigerian mobile number',
              });
            }
            const existing = await prisma.user.findUnique({ where: { phone }, select: { id: true, phoneVerified: true } });
            if (existing?.phoneVerified) {
              throw new APIError('UNPROCESSABLE_ENTITY', {
                code: 'PHONE_NUMBER_EXISTS',
                message: 'An account with this phone number already exists',
              });
            }
            // A sign-up that never verified its phone doesn't keep the number
            // reserved; whoever proves they own it gets it.
            if (existing) await prisma.user.delete({ where: { id: existing.id } });

            const username = await uniqueUsername(user.name, async (u) =>
              Boolean(await prisma.user.findUnique({ where: { username: u }, select: { id: true } })),
            );
            return { data: { ...user, username } };
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            const user = await prisma.user.findUnique({
              where: { id: session.userId },
              select: { phone: true, phoneVerified: true, status: true },
            });
            if (user?.status === 'suspended') {
              throw new APIError('FORBIDDEN', {
                code: 'ACCOUNT_SUSPENDED',
                message: 'This account has been suspended. Contact support for help.',
              });
            }
            if (user && !user.phoneVerified) {
              await sendVerificationCode(user.phone);
              // The caller proved the password, so it's safe to return the
              // number they need to verify.
              throw new APIError('FORBIDDEN', {
                code: 'PHONE_NOT_VERIFIED',
                message: 'Verify your phone number to continue. We just texted you a code.',
                phoneNumber: user.phone,
              });
            }
          },
        },
      },
    },

    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: OTP_MINUTES * 60,
        allowedAttempts: 5,
        disableSignUp: true,
        sendVerificationOTP: async ({ email: to, otp, type }) => {
          if (type !== 'email-verification' && type !== 'forget-password') return;
          await email.send(codeEmail(to, type, otp, OTP_MINUTES));
        },
      }),
      phoneNumber({
        otpLength: 6,
        expiresIn: OTP_MINUTES * 60,
        allowedAttempts: 5,
        phoneNumberValidator: isNigerianMobile,
        schema: { user: { fields: { phoneNumber: 'phone', phoneNumberVerified: 'phoneVerified' } } },
        sendOTP: async ({ phoneNumber: phone, code }) => {
          // Only text numbers that belong to an account awaiting verification,
          // so this public endpoint can't be used to send SMS to anyone.
          const user = await prisma.user.findUnique({ where: { phone }, select: { phoneVerified: true } });
          if (!user || user.phoneVerified) return;
          await sms.send(phone, `Your Naija Market code is ${code}. It expires in ${OTP_MINUTES} minutes. Never share it.`);
        },
        sendPasswordResetOTP: async ({ phoneNumber: phone, code }) => {
          await sms.send(
            phone,
            `Your Naija Market password reset code is ${code}. It expires in ${OTP_MINUTES} minutes. Never share it.`,
          );
        },
      }),
    ],
  });
  sendVerificationCode = (phone) => auth.api.sendPhoneNumberOTP({ body: { phoneNumber: phone } });
  return auth;
}

export type Auth = ReturnType<typeof createAuth>;
export type AuthSession = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>;
export type SessionUser = AuthSession['user'];
