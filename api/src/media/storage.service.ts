/** Where and how the browser uploads a file directly to storage. */
export interface SignedUpload {
  url: string;
  method: 'PUT';
  /** Headers the browser must send exactly as given (they're part of the signature). */
  headers: Record<string, string>;
  expiresAt: string;
}

/** Signed upload URLs stay valid this long. */
export const UPLOAD_URL_SECONDS = 10 * 60;

/**
 * Object storage for photos. Implemented by R2Storage (production) and
 * LocalStorage (development). Keys look like "listings/<id>.webp".
 */
export abstract class StorageService {
  /** A URL the browser can PUT exactly `bytes` bytes of `contentType` to. */
  abstract signUpload(key: string, contentType: string, bytes: number): Promise<SignedUpload>;
  /** The object's contents, or null if it doesn't exist. */
  abstract get(key: string): Promise<Buffer | null>;
  abstract put(key: string, body: Buffer, contentType: string): Promise<void>;
  abstract delete(key: string): Promise<void>;
  /** Public URL for objects under listings/. */
  abstract url(key: string): string;
}
