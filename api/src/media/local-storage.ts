import { createHmac, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { StorageService, UPLOAD_URL_SECONDS, type SignedUpload } from './storage.service.js';

/** Path of the API route that accepts signed local uploads (see setup-app.ts). */
export const LOCAL_UPLOAD_PATH = '/v1/uploads/local';

export interface LocalConfig {
  root: string;
  /** Public base URL for files, e.g. http://localhost:4000/media. */
  publicBaseUrl: string;
  /** Origin of this API, used to build upload URLs. */
  apiUrl: string;
  /** Secret for signing upload URLs. */
  secret: string;
}

/**
 * Development storage on local disk. It imitates R2's signed upload URLs
 * (an HMAC-signed PUT to the API), so the browser flow is the same as in
 * production.
 */
export class LocalStorage extends StorageService {
  readonly root: string;

  constructor(private readonly config: LocalConfig) {
    super();
    this.root = resolve(config.root);
  }

  async signUpload(key: string, contentType: string, bytes: number): Promise<SignedUpload> {
    const expires = Math.floor(Date.now() / 1000) + UPLOAD_URL_SECONDS;
    const params = new URLSearchParams({ key, type: contentType, bytes: String(bytes), expires: String(expires) });
    params.set('sig', this.sign(params));
    return {
      url: `${this.config.apiUrl}${LOCAL_UPLOAD_PATH}?${params}`,
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      expiresAt: new Date(expires * 1000).toISOString(),
    };
  }

  /**
   * Checks a signed upload the way R2 would: valid signature, not expired,
   * and the exact content type and size that were signed. Returns the key.
   */
  verifyUpload(query: Record<string, unknown>, contentType: string | undefined, bytes: number): string | null {
    const get = (name: string) => (typeof query[name] === 'string' ? (query[name] as string) : '');
    const params = new URLSearchParams({ key: get('key'), type: get('type'), bytes: get('bytes'), expires: get('expires') });
    const expected = Buffer.from(this.sign(params));
    const given = Buffer.from(get('sig'));
    const valid =
      given.length === expected.length &&
      timingSafeEqual(given, expected) &&
      Number(get('expires')) * 1000 > Date.now() &&
      get('type') === contentType &&
      Number(get('bytes')) === bytes;
    return valid ? get('key') : null;
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      return await readFile(this.pathFor(key));
    } catch {
      return null;
    }
  }

  async put(key: string, body: Buffer): Promise<void> {
    const path = this.pathFor(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);
  }

  async delete(key: string): Promise<void> {
    await rm(this.pathFor(key), { force: true });
  }

  url(key: string): string {
    return `${this.config.publicBaseUrl}/${key}`;
  }

  private sign(params: URLSearchParams): string {
    return createHmac('sha256', `${this.config.secret}:local-upload`).update(params.toString()).digest('base64url');
  }

  /** Resolves a key inside the media root, refusing anything that escapes it. */
  private pathFor(key: string): string {
    const path = resolve(this.root, key);
    if (!path.startsWith(this.root + sep)) throw new Error(`Invalid storage key: ${key}`);
    return path;
  }
}
