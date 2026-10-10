import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import sharp, { type OutputInfo } from 'sharp';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService, type SignedUpload } from './storage.service.js';

export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
const MAX_SIDE = 1600;

export interface ProcessedPhoto {
  uploadId: string;
  key: string;
  url: string;
  width: number;
  height: number;
}

/**
 * Photo uploads in two steps:
 * 1. `start`: the API records the upload and signs a URL for a private
 *    incoming/ key. The browser PUTs the original straight to storage.
 * 2. `complete`: the API re-encodes the original as WebP (which strips
 *    metadata such as GPS location), stores it under a public listings/ key
 *    and deletes the original.
 */
@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async start(ownerId: string, contentType: string, bytes: number): Promise<SignedUpload & { uploadId: string }> {
    const id = randomUUID();
    const incomingKey = `incoming/${ownerId}/${id}`;
    await this.prisma.mediaUpload.create({ data: { id, ownerId, incomingKey, contentType, bytes } });
    return { uploadId: id, ...(await this.storage.signUpload(incomingKey, contentType, bytes)) };
  }

  async complete(ownerId: string, uploadId: string): Promise<ProcessedPhoto> {
    const upload = await this.prisma.mediaUpload.findFirst({ where: { id: uploadId, ownerId } });
    if (!upload) throw new NotFoundException({ code: 'UPLOAD_NOT_FOUND', message: "We couldn't find that upload" });
    if (upload.status !== 'pending') return this.toPhoto(upload.id, upload.key!, upload.width!, upload.height!);

    const original = await this.storage.get(upload.incomingKey);
    if (!original) {
      throw new ConflictException({ code: 'UPLOAD_MISSING', message: 'The photo upload didn’t finish. Try adding it again.' });
    }

    let output: { data: Buffer; info: OutputInfo };
    try {
      if (original.length > MAX_PHOTO_BYTES) throw new Error('too large');
      output = await sharp(original, { limitInputPixels: 50_000_000 })
        .rotate() // apply the camera's orientation before metadata is dropped
        .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer({ resolveWithObject: true });
    } catch {
      await this.storage.delete(upload.incomingKey);
      await this.prisma.mediaUpload.delete({ where: { id: upload.id } });
      throw new BadRequestException({ code: 'INVALID_IMAGE', message: "That file isn't a photo we can use. Try a JPG or PNG." });
    }

    const key = `listings/${upload.id}.webp`;
    await this.storage.put(key, output.data, 'image/webp');
    await this.storage.delete(upload.incomingKey);
    const { width, height } = output.info;
    await this.prisma.mediaUpload.update({ where: { id: upload.id }, data: { status: 'ready', key, width, height } });
    return this.toPhoto(upload.id, key, width, height);
  }

  private toPhoto(uploadId: string, key: string, width: number, height: number): ProcessedPhoto {
    return { uploadId, key, url: this.storage.url(key), width, height };
  }
}
