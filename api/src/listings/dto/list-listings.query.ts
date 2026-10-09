import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { CONDITIONS, DELIVERY_METHODS, type ApiCondition, type ApiDelivery } from '../listing.mapper.js';

export const LISTING_SORTS = ['recommended', 'newest', 'price-asc', 'price-desc'] as const;
export type ListingSort = (typeof LISTING_SORTS)[number];

/** Query params for GET /v1/listings. Mirrors `ListingFilters` in the web app. */
export class ListListingsQuery {
  @ApiPropertyOptional({ description: 'Full-text search over title and description', example: 'iphone 13' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ example: 'phones' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({ example: 'Yaba' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  area?: string;

  @ApiPropertyOptional({ description: 'Minimum price in naira' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price in naira' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: CONDITIONS })
  @IsOptional()
  @IsIn(CONDITIONS)
  condition?: ApiCondition;

  @ApiPropertyOptional({ enum: DELIVERY_METHODS })
  @IsOptional()
  @IsIn(DELIVERY_METHODS)
  delivery?: ApiDelivery;

  @ApiPropertyOptional({ enum: LISTING_SORTS, default: 'recommended' })
  @IsOptional()
  @IsIn(LISTING_SORTS)
  sort?: ListingSort;

  @ApiPropertyOptional({ description: '`nextCursor` from the previous page' })
  @IsOptional()
  @IsUUID()
  cursor?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;
}
