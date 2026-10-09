import { randomUUID } from 'node:crypto';

/*
 * Listing photo keys carry the owner and the image size:
 *   listings/<userId>/<uuid>-<width>x<height>.webp
 * The owner prefix is how the API checks that a photo attached to a listing
 * was uploaded by the same user, and the size saves re-reading the image.
 */

const PHOTO_KEY = /^listings\/([0-9a-f-]{36})\/[0-9a-f-]{36}-(\d{1,5})x(\d{1,5})\.webp$/;

export function newPhotoKey(userId: string, width: number, height: number): string {
  return `listings/${userId}/${randomUUID()}-${width}x${height}.webp`;
}

/** The owner and size of a photo key, or null if the key isn't one of ours. */
export function parsePhotoKey(key: string): { userId: string; width: number; height: number } | null {
  const match = PHOTO_KEY.exec(key);
  if (!match) return null;
  return { userId: match[1]!, width: Number(match[2]), height: Number(match[3]) };
}
