import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import type { Env } from '../config/env.js';

/**
 * Stores uploaded files by key (e.g. "listings/<userId>/<id>-1600x1200.webp").
 * Only local disk exists so far; R2 will implement the same methods.
 */
@Injectable()
export class StorageService {
  readonly root: string;
  private readonly baseUrl: string;

  constructor(config: ConfigService<Env, true>) {
    this.root = resolve(config.get('MEDIA_DIR', { infer: true }));
    this.baseUrl = config.get('MEDIA_BASE_URL', { infer: true });
  }

  async put(key: string, body: Buffer): Promise<void> {
    const path = this.pathFor(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await stat(this.pathFor(key))).isFile();
    } catch {
      return false;
    }
  }

  url(key: string): string {
    return `${this.baseUrl}/${key}`;
  }

  /** Resolves a key inside the media root, refusing anything that escapes it. */
  private pathFor(key: string): string {
    const path = resolve(this.root, key);
    if (!path.startsWith(this.root + sep)) throw new Error(`Invalid storage key: ${key}`);
    return path;
  }
}
