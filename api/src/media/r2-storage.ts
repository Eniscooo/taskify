import { DeleteObjectCommand, GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageService, UPLOAD_URL_SECONDS, type SignedUpload } from './storage.service.js';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** Public base URL of the bucket (its custom domain), e.g. https://media.naijamarket.ng. */
  publicBaseUrl: string;
}

/**
 * Cloudflare R2 through its S3-compatible API. Browsers upload with
 * presigned PUT URLs; the access keys never leave the server.
 */
export class R2Storage extends StorageService {
  private readonly client: S3Client;

  constructor(private readonly config: R2Config) {
    super();
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    });
  }

  async signUpload(key: string, contentType: string, bytes: number): Promise<SignedUpload> {
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: bytes,
    });
    // Signing the type and length means the browser can't upload anything else.
    const url = await getSignedUrl(this.client, command, {
      expiresIn: UPLOAD_URL_SECONDS,
      signableHeaders: new Set(['content-type', 'content-length']),
    });
    return {
      url,
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      expiresAt: new Date(Date.now() + UPLOAD_URL_SECONDS * 1000).toISOString(),
    };
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      const res = await this.client.send(new GetObjectCommand({ Bucket: this.config.bucket, Key: key }));
      return res.Body ? Buffer.from(await res.Body.transformToByteArray()) : null;
    } catch (err) {
      if (err instanceof NoSuchKey) return null;
      throw err;
    }
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        // Keys are never reused, so CDNs and browsers can cache forever.
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
  }

  url(key: string): string {
    return `${this.config.publicBaseUrl}/${key}`;
  }
}
