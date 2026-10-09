import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CONDITIONS, DELIVERY_METHODS, type ApiCondition, type ApiDelivery } from '../listing.mapper.js';

export const MAX_PHOTOS = 10;

/**
 * Field shapes and limits. Whether a listing is complete enough to publish
 * is checked by the service, because drafts can be saved half-filled.
 */
export class CreateListingDto {
  @ApiProperty({ example: 'iPhone 13, 128GB, Midnight' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  title!: string;

  @ApiPropertyOptional({ example: 'phones' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({ enum: CONDITIONS })
  @IsOptional()
  @IsIn(CONDITIONS)
  condition?: ApiCondition;

  @ApiPropertyOptional({ description: 'Whole naira', example: 385000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  price?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  negotiable?: boolean;

  @ApiPropertyOptional({ example: 'Yaba' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  area?: string;

  @ApiPropertyOptional({ enum: DELIVERY_METHODS })
  @IsOptional()
  @IsIn(DELIVERY_METHODS)
  delivery?: ApiDelivery;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ type: [String], description: 'Keys from POST /v1/uploads/listing-photo; the first is the cover' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_PHOTOS)
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({ enum: ['active', 'draft'], default: 'active', description: '"draft" saves without publishing' })
  @IsOptional()
  @IsIn(['active', 'draft'])
  status?: 'active' | 'draft';
}

export const OWNER_STATUSES = ['active', 'draft', 'sold'] as const;

/** Any subset of fields. `status` also allows "sold". */
export class UpdateListingDto extends PartialType(OmitType(CreateListingDto, ['status'] as const)) {
  @ApiPropertyOptional({ enum: OWNER_STATUSES })
  @IsOptional()
  @IsIn(OWNER_STATUSES)
  status?: (typeof OWNER_STATUSES)[number];
}
