import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { StorageService } from '../src/media/storage.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp } from './support.js';

/**
 * Selling: photo uploads, drafts, publishing, editing, marking sold and
 * removing. Runs against the local Postgres + Redis from `npm run services`.
 */
describe('Selling (e2e)', () => {
  let t: Awaited<ReturnType<typeof createTestApp>>;
  let seller: Awaited<ReturnType<typeof t.signedInUser>>;
  let other: Awaited<ReturnType<typeof t.signedInUser>>;
  let photo: Buffer;

  beforeAll(async () => {
    t = await createTestApp();
    seller = await t.signedInUser();
    other = await t.signedInUser();
    photo = await sharp({ create: { width: 2400, height: 1800, channels: 3, background: '#0a7c4a' } })
      .jpeg()
      .withExifMerge({ IFD0: { Copyright: 'secret-location' } })
      .toBuffer();
  });

  afterAll(async () => {
    const prisma = t.app.get(PrismaService);
    const storage = t.app.get(StorageService);
    const ids = [seller.id, other.id];
    await prisma.listing.deleteMany({ where: { sellerId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await Promise.all(ids.map((id) => rm(join(storage.root, 'listings', id), { recursive: true, force: true })));
    await t.app.close();
  });

  const upload = async (c = seller.c) =>
    (await c.upload('/v1/uploads/listing-photo', photo, 'phone.jpg').expect(200)).body as { key: string; url: string };

  const complete = {
    title: 'Samsung Galaxy S21, 128GB',
    category: 'phones',
    condition: 'used-good',
    price: 210000,
    area: 'Yaba',
    delivery: 'both',
    description: 'Clean phone, no cracks, battery health 90%. Comes with charger.',
  };

  it('requires sign-in to upload or create', async () => {
    await t.client().post('/v1/listings', complete).expect(401);
    await t.client().upload('/v1/uploads/listing-photo', photo, 'x.jpg').expect(401);
  });

  it('resizes uploads to WebP, strips metadata and serves them to the web app', async () => {
    const { key, url } = await upload();
    expect(key).toMatch(new RegExp(`^listings/${seller.id}/[0-9a-f-]{36}-1600x1200\\.webp$`));

    const res = await t.client().get(new URL(url).pathname).expect(200);
    expect(res.headers['content-type']).toBe('image/webp');
    expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
    const meta = await sharp(res.body as Buffer).metadata();
    expect(meta.exif).toBeUndefined();
  });

  it('rejects files that are not images', async () => {
    const res = await seller.c.upload('/v1/uploads/listing-photo', Buffer.from('not an image'), 'x.jpg').expect(400);
    expect(res.body.error.code).toBe('INVALID_IMAGE');
  });

  it('saves a half-filled draft that only the seller can see', async () => {
    const draft = (await seller.c.post('/v1/listings', { title: 'Old sofa', status: 'draft' }).expect(201)).body;
    expect(draft).toMatchObject({ status: 'draft', category: null, price: 0 });

    await t.client().get(`/v1/listings/${draft.id}`).expect(404);
    const mine = (await seller.c.get('/v1/me/listings').expect(200)).body as { id: string }[];
    expect(mine.map((l) => l.id)).toContain(draft.id);
    await other.c.get(`/v1/me/listings/${draft.id}`).expect(404);
  });

  it('lists what is missing when publishing an incomplete listing', async () => {
    const res = await seller.c.post('/v1/listings', { title: 'Sofa' }).expect(400);
    expect(res.body.error.code).toBe('LISTING_INCOMPLETE');
    const fields = (res.body.error.details as { field: string }[]).map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['photos', 'title', 'category', 'price', 'description']));
  });

  it('publishes, edits, marks sold and removes a listing', async () => {
    const { key } = await upload();
    const created = (await seller.c.post('/v1/listings', { ...complete, photos: [key] }).expect(201)).body;
    expect(created).toMatchObject({ status: 'active', price: 210000, photoCount: 1, negotiable: true });
    expect(created.images[0]).toMatchObject({ key, width: 1600, height: 1200 });

    const pub = (await t.client().get(`/v1/listings/${created.id}`).expect(200)).body;
    expect(pub.seller.id).toBe(seller.id);

    await other.c.patch(`/v1/listings/${created.id}`, { price: 1 }).expect(404);
    const edited = (await seller.c.patch(`/v1/listings/${created.id}`, { price: 195000, negotiable: false }).expect(200)).body;
    expect(edited).toMatchObject({ price: 195000, negotiable: false });

    await seller.c.patch(`/v1/listings/${created.id}`, { description: 'too short' }).expect(400);
    await seller.c.patch(`/v1/listings/${created.id}`, { status: 'sold' }).expect(200);
    expect((await t.client().get(`/v1/listings/${created.id}`).expect(200)).body.status).toBe('sold');

    await other.c.delete(`/v1/listings/${created.id}`).expect(404);
    await seller.c.delete(`/v1/listings/${created.id}`).expect(204);
    await t.client().get(`/v1/listings/${created.id}`).expect(404);
  });

  it("refuses photos uploaded by someone else", async () => {
    const { key } = await upload(other.c);
    const res = await seller.c.post('/v1/listings', { ...complete, photos: [key] }).expect(400);
    expect(res.body.error.code).toBe('INVALID_PHOTO');
  });

  it('removes a half-filled draft', async () => {
    const draft = (await seller.c.post('/v1/listings', { title: 'Shelf', status: 'draft' }).expect(201)).body;
    await seller.c.delete(`/v1/listings/${draft.id}`).expect(204);
    await seller.c.get(`/v1/me/listings/${draft.id}`).expect(404);
  });

  it("won't mark a draft as sold", async () => {
    const draft = (await seller.c.post('/v1/listings', { title: 'Fan', status: 'draft' }).expect(201)).body;
    const res = await seller.c.patch(`/v1/listings/${draft.id}`, { status: 'sold' }).expect(409);
    expect(res.body.error.code).toBe('INVALID_STATUS');
  });
});
