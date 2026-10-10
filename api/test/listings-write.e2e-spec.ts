import sharp from 'sharp';
import { StorageService } from '../src/media/storage.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp } from './support.js';

/**
 * Selling: signed photo uploads, drafts, publishing, editing, marking sold
 * and removing. Uses local storage, which imitates R2's signed URLs. Runs
 * against the local Postgres + Redis from `npm run services`.
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
    const uploads = await prisma.mediaUpload.findMany({ where: { ownerId: { in: ids } } });
    await Promise.all(uploads.flatMap((u) => [storage.delete(u.incomingKey), u.key && storage.delete(u.key)]));
    await prisma.listing.deleteMany({ where: { sellerId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await t.app.close();
  });

  const upload = (c = seller.c) => t.uploadPhoto(c, photo);

  const complete = {
    title: 'Samsung Galaxy S21, 128GB',
    category: 'phones',
    condition: 'used-good',
    price: 210000,
    area: 'Yaba',
    delivery: 'both',
    description: 'Clean phone, no cracks, battery health 90%. Comes with charger.',
  };

  describe('photo uploads', () => {
    it('requires sign-in', async () => {
      await t.client().post('/v1/uploads/listing-photo', { contentType: 'image/jpeg', bytes: 100 }).expect(401);
      await t.client().post('/v1/listings', complete).expect(401);
    });

    it('only signs URLs for photos up to 15 MB', async () => {
      await seller.c.post('/v1/uploads/listing-photo', { contentType: 'image/gif', bytes: 100 }).expect(400);
      await seller.c.post('/v1/uploads/listing-photo', { contentType: 'image/jpeg', bytes: 16 * 1024 * 1024 }).expect(400);
    });

    it('uploads directly with a signed URL, then re-encodes without metadata', async () => {
      const result = await upload();
      expect(result.key).toBe(`listings/${result.uploadId}.webp`);
      expect(result).toMatchObject({ width: 1600, height: 1200 });

      const res = await t.client().get(new URL(result.url).pathname).expect(200);
      expect(res.headers['content-type']).toBe('image/webp');
      expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
      expect((await sharp(res.body as Buffer).metadata()).exif).toBeUndefined();

      // Postgres records the owner and keys; the original is gone.
      const row = await t.app.get(PrismaService).mediaUpload.findUniqueOrThrow({ where: { id: result.uploadId } });
      expect(row).toMatchObject({ ownerId: seller.id, status: 'ready', key: result.key, width: 1600, height: 1200 });
      expect(await t.app.get(StorageService).get(row.incomingKey)).toBeNull();
    });

    it('rejects uploads that differ from what was signed', async () => {
      const start = (await seller.c.post('/v1/uploads/listing-photo', { contentType: 'image/jpeg', bytes: photo.length }).expect(201)).body;
      await t.putSigned(start.url, Buffer.concat([photo, Buffer.from('extra')]), start.headers).expect(403);
      await t.putSigned(start.url, photo, { 'Content-Type': 'image/png' }).expect(403);
      await t.putSigned(start.url.replace('sig=', 'sig=x'), photo, start.headers).expect(403);
    });

    it('needs the file before completing, and only the owner can complete', async () => {
      const start = (await seller.c.post('/v1/uploads/listing-photo', { contentType: 'image/jpeg', bytes: photo.length }).expect(201)).body;
      const res = await seller.c.post(`/v1/uploads/${start.uploadId}/complete`).expect(409);
      expect(res.body.error.code).toBe('UPLOAD_MISSING');

      await t.putSigned(start.url, photo, start.headers).expect(200);
      await other.c.post(`/v1/uploads/${start.uploadId}/complete`).expect(404);
      await seller.c.post(`/v1/uploads/${start.uploadId}/complete`).expect(200);
    });

    it('keeps unprocessed originals private', async () => {
      const start = (await seller.c.post('/v1/uploads/listing-photo', { contentType: 'image/jpeg', bytes: photo.length }).expect(201)).body;
      await t.putSigned(start.url, photo, start.headers).expect(200);
      const incomingKey = new URL(start.url).searchParams.get('key');
      await t.client().get(`/media/${incomingKey}`).expect(404);
    });

    it('rejects files that are not images', async () => {
      const junk = Buffer.from('not an image');
      const start = (await seller.c.post('/v1/uploads/listing-photo', { contentType: 'image/jpeg', bytes: junk.length }).expect(201)).body;
      await t.putSigned(start.url, junk, start.headers).expect(200);
      const res = await seller.c.post(`/v1/uploads/${start.uploadId}/complete`).expect(400);
      expect(res.body.error.code).toBe('INVALID_IMAGE');
    });
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
    const { key, uploadId } = await upload();
    const created = (await seller.c.post('/v1/listings', { ...complete, photos: [key] }).expect(201)).body;
    expect(created).toMatchObject({ status: 'active', price: 210000, photoCount: 1, negotiable: true });
    expect(created.images[0]).toMatchObject({ key, width: 1600, height: 1200 });
    const row = await t.app.get(PrismaService).mediaUpload.findUniqueOrThrow({ where: { id: uploadId } });
    expect(row.status).toBe('attached');

    const pub = (await t.client().get(`/v1/listings/${created.id}`).expect(200)).body;
    expect(pub.seller.id).toBe(seller.id);

    await other.c.patch(`/v1/listings/${created.id}`, { price: 1 }).expect(404);
    const edited = (await seller.c.patch(`/v1/listings/${created.id}`, { price: 195000, negotiable: false }).expect(200)).body;
    expect(edited).toMatchObject({ price: 195000, negotiable: false });
    // Re-sending the listing's existing photos is allowed.
    await seller.c.patch(`/v1/listings/${created.id}`, { photos: [key] }).expect(200);

    await seller.c.patch(`/v1/listings/${created.id}`, { description: 'too short' }).expect(400);
    await seller.c.patch(`/v1/listings/${created.id}`, { status: 'sold' }).expect(200);
    expect((await t.client().get(`/v1/listings/${created.id}`).expect(200)).body.status).toBe('sold');

    await other.c.delete(`/v1/listings/${created.id}`).expect(404);
    await seller.c.delete(`/v1/listings/${created.id}`).expect(204);
    await t.client().get(`/v1/listings/${created.id}`).expect(404);
  });

  it('refuses photos uploaded by someone else', async () => {
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
