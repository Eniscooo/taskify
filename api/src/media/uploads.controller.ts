import { Body, Controller, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsIn, IsInt, Max, Min } from 'class-validator';
import type { SessionUser } from '../auth/auth.js';
import { CurrentUser } from '../auth/decorators.js';
import { MAX_PHOTO_BYTES, PHOTO_TYPES, UploadsService } from './uploads.service.js';

class StartUploadDto {
  @ApiProperty({ enum: PHOTO_TYPES })
  @IsIn(PHOTO_TYPES)
  contentType!: (typeof PHOTO_TYPES)[number];

  @ApiProperty({ description: 'File size in bytes', maximum: MAX_PHOTO_BYTES })
  @IsInt()
  @Min(1)
  @Max(MAX_PHOTO_BYTES, { message: 'Photos can be up to 15 MB' })
  bytes!: number;
}

class StartUploadResponse {
  @ApiProperty() uploadId!: string;
  @ApiProperty({ description: 'PUT the file here' }) url!: string;
  @ApiProperty({ enum: ['PUT'] }) method!: 'PUT';
  @ApiProperty({ description: 'Send these headers with the PUT', type: Object }) headers!: Record<string, string>;
  @ApiProperty({ format: 'date-time' }) expiresAt!: string;
}

class UploadedPhotoResponse {
  @ApiProperty() uploadId!: string;
  @ApiProperty({ description: 'Pass this in `photos` when creating or editing a listing' }) key!: string;
  @ApiProperty() url!: string;
  @ApiProperty() width!: number;
  @ApiProperty() height!: number;
}

/**
 * Listing photos go straight from the browser to storage with a signed URL;
 * storage credentials never reach the client. See UploadsService.
 */
@ApiTags('uploads')
@ApiCookieAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('listing-photo')
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  @ApiCreatedResponse({ type: StartUploadResponse })
  start(@CurrentUser() user: SessionUser, @Body() dto: StartUploadDto) {
    return this.uploads.start(user.id, dto.contentType, dto.bytes);
  }

  @Post(':id/complete')
  @HttpCode(200)
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  @ApiOkResponse({ type: UploadedPhotoResponse })
  complete(@CurrentUser() user: SessionUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.uploads.complete(user.id, id);
  }
}
