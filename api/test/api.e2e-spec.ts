import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import 'dotenv/config';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/setup-app.js';

/**
 * Runs against the local Postgres + Redis from `npm run services`, seeded
 * with `npm run db:seed`.
 */
describe('API (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/health reports database and redis up', async () => {
    const res = await http.get('/v1/health').expect(200);
    expect(res.body).toEqual({ status: 'ok', database: 'up', redis: 'up' });
  });

  it('GET /v1/categories lists categories in order', async () => {
    const res = await http.get('/v1/categories').expect(200);
    expect(res.body[0]).toEqual({ slug: 'phones', name: 'Phones' });
  });

  describe('GET /v1/listings', () => {
    it('returns a page of active listings in naira', async () => {
      const res = await http.get('/v1/listings?limit=5').expect(200);
      expect(res.body.items).toHaveLength(5);
      expect(res.body.nextCursor).toEqual(expect.any(String));
      const first = res.body.items[0];
      expect(first).toMatchObject({ price: expect.any(Number), condition: expect.stringMatching(/^[a-z-]+$/) });
      expect(first.seller).not.toHaveProperty('phone');
      expect(res.body.items.every((l: { status: string }) => l.status === 'active')).toBe(true);
    });

    it('paginates with the cursor without repeating items', async () => {
      const page1 = await http.get('/v1/listings?limit=4&sort=price-asc').expect(200);
      const page2 = await http.get(`/v1/listings?limit=4&sort=price-asc&cursor=${page1.body.nextCursor}`).expect(200);
      const ids1 = page1.body.items.map((l: { id: string }) => l.id);
      const ids2 = page2.body.items.map((l: { id: string }) => l.id);
      expect(ids2.some((id: string) => ids1.includes(id))).toBe(false);
      expect(page2.body.items[0].price).toBeGreaterThanOrEqual(page1.body.items.at(-1).price);
    });

    it('full-text searches title and description', async () => {
      const res = await http.get('/v1/listings?q=iphone').expect(200);
      expect(res.body.items.length).toBeGreaterThan(0);
      expect(res.body.items.every((l: { title: string }) => /iphone/i.test(l.title))).toBe(true);
    });

    it('filters by category, price and delivery', async () => {
      const res = await http
        .get('/v1/listings?category=phones&minPrice=300000&maxPrice=400000&delivery=pickup')
        .expect(200);
      for (const l of res.body.items) {
        expect(l.category).toBe('phones');
        expect(l.price).toBeGreaterThanOrEqual(300000);
        expect(l.price).toBeLessThanOrEqual(400000);
        expect(['pickup', 'both']).toContain(l.delivery);
      }
    });

    it('rejects invalid query params with VALIDATION_FAILED', async () => {
      const res = await http.get('/v1/listings?limit=500&condition=broken&hack=1').expect(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
      const fields = res.body.error.details.map((d: { field: string }) => d.field);
      expect(fields).toEqual(expect.arrayContaining(['limit', 'condition', 'hack']));
    });
  });

  describe('GET /v1/listings/:id', () => {
    it('returns one listing', async () => {
      const { body } = await http.get('/v1/listings?limit=1').expect(200);
      const res = await http.get(`/v1/listings/${body.items[0].id}`).expect(200);
      expect(res.body.id).toBe(body.items[0].id);
    });

    it('404s with a friendly message for unknown ids', async () => {
      const res = await http.get('/v1/listings/0199b6c0-0000-7000-8000-000000000000').expect(404);
      expect(res.body.error).toEqual({ code: 'LISTING_NOT_FOUND', message: 'This listing is no longer available' });
    });

    it('400s for malformed ids', async () => {
      await http.get('/v1/listings/not-a-uuid').expect(400);
    });
  });
});
