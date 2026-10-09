import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import sharp, { type OutputInfo } from 'sharp';
import type { SessionUser } from '../auth/auth.js';
import { CurrentUser } from '../auth/decorators.js';
import { newPhotoKey } from './photo-key.js';
import { StorageService } from './storage.service.js';

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const MAX_SIDE = 1600;

class UploadedPhotoResponse {
  @ApiProperty({ description: 'Pass this in `photos` when creating or editing a listing' }) key!: string;
  @ApiProperty() url!: string;
  @ApiProperty() width!: number;
  @ApiProperty() height!: number;
}

@ApiTags('uploads')
@ApiCookieAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  /**
   * Re-encodes the photo as WebP, at most 1600px on its longest side. This
   * also strips metadata such as the GPS location phones add to photos, and
   * rejects anything that isn't really an image.
   */
  @Post('listing-photo')
  @HttpCode(200)
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOkResponse({ type: UploadedPhotoResponse })
  async uploadListingPhoto(
    @CurrentUser() user: SessionUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<UploadedPhotoResponse> {
    if (!file) throw new BadRequestException({ code: 'FILE_REQUIRED', message: 'Choose a photo to upload' });

    let output: { data: Buffer; info: OutputInfo };
    try {
      output = await sharp(file.buffer, { limitInputPixels: 50_000_000 })
        .rotate() // apply the camera's orientation before metadata is dropped
        .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer({ resolveWithObject: true });
    } catch {
      throw new BadRequestException({ code: 'INVALID_IMAGE', message: "That file isn't a photo we can use. Try a JPG or PNG." });
    }

    const key = newPhotoKey(user.id, output.info.width, output.info.height);
    await this.storage.put(key, output.data);
    return { key, url: this.storage.url(key), width: output.info.width, height: output.info.height };
  }
}
