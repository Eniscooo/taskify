import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import 'dotenv/config';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { EmailService } from '../src/email/email.service.js';
import { setupApp } from '../src/setup-app.js';
import { SmsService } from '../src/sms/sms.service.js';

export const ORIGIN = 'http://localhost:3000';

/** The real app, with SMS and email captured instead of sent. */
export async function createTestApp() {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false, logger: false });
  setupApp(app);
  await app.init();

  const sms: { to: string; message: string }[] = [];
  vi.spyOn(app.get(SmsService), 'send').mockImplementation(async (to, message) => {
    sms.push({ to, message });
  });
  vi.spyOn(app.get(EmailService), 'send').mockImplementation(async () => {});

  /** A browser-like client: keeps cookies and sends the web app's Origin. */
  function client() {
    const agent = request.agent(app.getHttpServer());
    return {
      get: (path: string) => agent.get(path).set('Origin', ORIGIN),
      post: (path: string, body?: object) => agent.post(path).set('Origin', ORIGIN).send(body),
      patch: (path: string, body: object) => agent.patch(path).set('Origin', ORIGIN).send(body),
      delete: (path: string) => agent.delete(path).set('Origin', ORIGIN),
    };
  }

  /**
   * PUTs a file to a signed upload URL the way a browser would: no cookies,
   * just the signed headers. Local storage's URLs point at this API.
   */
  function putSigned(url: string, body: Buffer, headers: Record<string, string>) {
    const { pathname, search } = new URL(url);
    return request(app.getHttpServer()).put(pathname + search).set('Origin', ORIGIN).set(headers).send(body);
  }

  /** The full upload flow: get a signed URL, PUT the file, then complete. */
  async function uploadPhoto(c: ReturnType<typeof client>, body: Buffer, contentType = 'image/jpeg') {
    const start = (await c.post('/v1/uploads/listing-photo', { contentType, bytes: body.length }).expect(201)).body;
    await putSigned(start.url, body, start.headers).expect(200);
    return (await c.post(`/v1/uploads/${start.uploadId}/complete`).expect(200)).body as {
      uploadId: string;
      key: string;
      url: string;
      width: number;
      height: number;
    };
  }

  let counter = 0;
  const run = Date.now().toString().slice(-7);

  /** Signs up a new user, verifies their phone and returns a signed-in client. */
  async function signedInUser() {
    const phone = `+23490${run}${counter++ % 10}`;
    const c = client();
    await c
      .post('/v1/auth/sign-up/email', { name: 'Seller Test', email: `e2e-${phone.slice(1)}@example.com`, password: 'correct-horse-1', phoneNumber: phone })
      .expect(200);
    await c.post('/v1/auth/phone-number/send-otp', { phoneNumber: phone }).expect(200);
    const code = sms.findLast((m) => m.to === phone)?.message.match(/\b\d{6}\b/)?.[0];
    await c.post('/v1/auth/phone-number/verify', { phoneNumber: phone, code }).expect(200);
    const me = await c.get('/v1/me').expect(200);
    return { c, id: me.body.id as string, phone };
  }

  return { app, client, signedInUser, putSigned, uploadPhoto };
}
