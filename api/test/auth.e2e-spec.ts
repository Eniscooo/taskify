import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import 'dotenv/config';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { EmailService } from '../src/email/email.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { setupApp } from '../src/setup-app.js';
import { SmsService } from '../src/sms/sms.service.js';

/**
 * Sign-up, phone verification, sign-in and password reset through the real
 * Better Auth routes. SMS messages are captured instead of logged. Runs
 * against the local Postgres + Redis from `npm run services`.
 */
describe('Auth (e2e)', () => {
  const ORIGIN = 'http://localhost:3000';
  const run = Date.now().toString().slice(-7);
  const createdPhones: string[] = [];
  const sms: { to: string; message: string }[] = [];
  const emails: { to: string; text: string }[] = [];

  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false, logger: false });
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    vi.spyOn(app.get(SmsService), 'send').mockImplementation(async (to, message) => {
      sms.push({ to, message });
    });
    vi.spyOn(app.get(EmailService), 'send').mockImplementation(async ({ to, text }) => {
      emails.push({ to, text });
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { phone: { in: createdPhones } } });
    await app.close();
  });

  /** A browser-like client: keeps cookies and sends the web app's Origin. */
  function client() {
    const agent = request.agent(app.getHttpServer());
    return {
      post: (path: string, body: object) => agent.post(path).set('Origin', ORIGIN).send(body),
      get: (path: string) => agent.get(path).set('Origin', ORIGIN),
    };
  }

  /** A new valid Nigerian number per test, e.g. +2348112345671. */
  function newPhone(suffix: number) {
    const phone = `+23481${run}${suffix}`;
    createdPhones.push(phone);
    return phone;
  }

  function lastCodeSentTo(phone: string) {
    const message = sms.findLast((m) => m.to === phone)?.message;
    return message?.match(/\b\d{6}\b/)?.[0];
  }

  function lastCodeEmailedTo(email: string) {
    return emails.findLast((m) => m.to === email)?.text.match(/\b\d{6}\b/)?.[0];
  }

  /** Signs up and verifies the phone, returning a signed-in client. */
  async function signedInUser(phone: string) {
    const account = await signUp(phone);
    await account.c.post('/v1/auth/phone-number/send-otp', { phoneNumber: phone });
    await account.c.post('/v1/auth/phone-number/verify', { phoneNumber: phone, code: lastCodeSentTo(phone) }).expect(200);
    return account;
  }

  async function signUp(phone: string, password = 'correct-horse-1') {
    const c = client();
    const email = `e2e-${phone.slice(1)}@example.com`;
    await c.post('/v1/auth/sign-up/email', { name: 'Test User', email, password, phoneNumber: phone }).expect(200);
    return { c, email, password };
  }

  it('requires a session for /v1/me', async () => {
    const res = await client().get('/v1/me').expect(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('signs up without a session, then verifies the phone by SMS code', async () => {
    const phone = newPhone(1);
    const { c } = await signUp(phone);
    await c.get('/v1/me').expect(401);

    await c.post('/v1/auth/phone-number/send-otp', { phoneNumber: phone }).expect(200);
    const code = lastCodeSentTo(phone);
    expect(code).toBeDefined();

    await c.post('/v1/auth/phone-number/verify', { phoneNumber: phone, code: '000000' }).expect(400);
    await c.post('/v1/auth/phone-number/verify', { phoneNumber: phone, code }).expect(200);

    const me = await c.get('/v1/me').expect(200);
    expect(me.body).toMatchObject({ phone, phoneVerified: true, username: expect.stringMatching(/^test\.u/) });
  });

  it('texts a code instead of signing in when the phone is unverified', async () => {
    const phone = newPhone(2);
    const { c, email, password } = await signUp(phone);

    const res = await c.post('/v1/auth/sign-in/email', { email, password }).expect(403);
    expect(res.body).toMatchObject({ code: 'PHONE_NOT_VERIFIED', phoneNumber: phone });
    expect(lastCodeSentTo(phone)).toBeDefined();
    await c.get('/v1/me').expect(401);
  });

  it('signs in with phone or email, and signs out', async () => {
    const phone = newPhone(3);
    const { c, email, password } = await signUp(phone);
    await c.post('/v1/auth/phone-number/send-otp', { phoneNumber: phone });
    await c.post('/v1/auth/phone-number/verify', { phoneNumber: phone, code: lastCodeSentTo(phone), disableSession: true });

    await client().post('/v1/auth/sign-in/phone-number', { phoneNumber: phone, password: 'wrong-password' }).expect(401);

    const byPhone = client();
    await byPhone.post('/v1/auth/sign-in/phone-number', { phoneNumber: phone, password }).expect(200);
    await byPhone.get('/v1/me').expect(200);

    const byEmail = client();
    await byEmail.post('/v1/auth/sign-in/email', { email, password }).expect(200);
    await byEmail.get('/v1/me').expect(200);

    await byEmail.post('/v1/auth/sign-out', {}).expect(200);
    await byEmail.get('/v1/me').expect(401);
  });

  it('rejects a second account with a verified phone number', async () => {
    const phone = newPhone(4);
    const { c } = await signUp(phone);
    await c.post('/v1/auth/phone-number/send-otp', { phoneNumber: phone });
    await c.post('/v1/auth/phone-number/verify', { phoneNumber: phone, code: lastCodeSentTo(phone) }).expect(200);

    const res = await client()
      .post('/v1/auth/sign-up/email', { name: 'Copy Cat', email: `copy-${run}@example.com`, password: 'whatever-123', phoneNumber: phone })
      .expect(422);
    expect(res.body.code).toBe('PHONE_NUMBER_EXISTS');
  });

  it('does not text numbers that have no account', async () => {
    const phone = newPhone(5);
    await client().post('/v1/auth/phone-number/send-otp', { phoneNumber: phone }).expect(200);
    expect(lastCodeSentTo(phone)).toBeUndefined();
  });

  it('resets the password with an SMS code and ends existing sessions', async () => {
    const phone = newPhone(6);
    const { c, password } = await signUp(phone);
    await c.post('/v1/auth/phone-number/send-otp', { phoneNumber: phone });
    await c.post('/v1/auth/phone-number/verify', { phoneNumber: phone, code: lastCodeSentTo(phone) }).expect(200);
    await c.get('/v1/me').expect(200);

    const other = client();
    await other.post('/v1/auth/phone-number/request-password-reset', { phoneNumber: phone }).expect(200);
    const otp = lastCodeSentTo(phone);
    await other
      .post('/v1/auth/phone-number/reset-password', { phoneNumber: phone, otp, newPassword: 'new-password-2' })
      .expect(200);

    await c.get('/v1/me').expect(401);
    await client().post('/v1/auth/sign-in/phone-number', { phoneNumber: phone, password }).expect(401);
    await client().post('/v1/auth/sign-in/phone-number', { phoneNumber: phone, password: 'new-password-2' }).expect(200);
  });

  it('verifies the email address with an emailed code', async () => {
    const { c, email } = await signedInUser(newPhone(7));
    expect((await c.get('/v1/me')).body.emailVerified).toBe(false);

    await c.post('/v1/auth/email-otp/send-verification-otp', { email, type: 'email-verification' }).expect(200);
    const otp = lastCodeEmailedTo(email);
    expect(otp).toBeDefined();
    await c.post('/v1/auth/email-otp/verify-email', { email, otp: '000000' }).expect(400);
    await c.post('/v1/auth/email-otp/verify-email', { email, otp }).expect(200);

    expect((await c.get('/v1/me')).body.emailVerified).toBe(true);
  });

  it('resets the password with an emailed code', async () => {
    const phone = newPhone(8);
    const { email } = await signedInUser(phone);

    const c = client();
    await c.post('/v1/auth/email-otp/request-password-reset', { email }).expect(200);
    const otp = lastCodeEmailedTo(email);
    await c.post('/v1/auth/email-otp/reset-password', { email, otp, password: 'emailed-reset-3' }).expect(200);

    await client().post('/v1/auth/sign-in/email', { email, password: 'emailed-reset-3' }).expect(200);
  });

  it('does not email codes for accounts that do not exist', async () => {
    const email = `nobody-${run}@example.com`;
    await client().post('/v1/auth/email-otp/request-password-reset', { email }).expect(200);
    expect(lastCodeEmailedTo(email)).toBeUndefined();
  });

  it('has no passwordless email sign-in', async () => {
    await client().post('/v1/auth/sign-in/email-otp', { email: 'x@example.com', otp: '123456' }).expect(404);
  });

  it('rejects auth requests from untrusted origins', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/sign-in/email')
      .set('Origin', 'https://evil.example')
      .send({ email: 'x@example.com', password: 'whatever-123' })
      .expect(403);
  });
});
