import { ApiProperty } from '@nestjs/swagger';
import { koboToNaira } from '../common/money.js';
import type { DeliveryMethod, ListingCondition } from '../generated/prisma/client.js';
import type { ListingWithRelations } from './listings.service.js';

/** Public API values (hyphenated, matching the web app) ↔ database enum values. */
export const CONDITIONS = ['new', 'like-new', 'used-good', 'used-fair'] as const;
export const DELIVERY_METHODS = ['pickup', 'seller-delivers', 'both'] as const;
export type ApiCondition = (typeof CONDITIONS)[number];
export type ApiDelivery = (typeof DELIVERY_METHODS)[number];

export const toDbEnum = <T extends string>(v: string) => v.replace(/-/g, '_') as T;
const toApiEnum = <T extends string>(v: string) => v.replace(/_/g, '-') as T;

class ListingImageResponse {
  @ApiProperty() url!: string;
  @ApiProperty({ nullable: true, type: Number }) width!: number | null;
  @ApiProperty({ nullable: true, type: Number }) height!: number | null;
}

class SellerSummary {
  @ApiProperty() id!: string;
  @ApiProperty() username!: string;
  @ApiProperty({ example: 'Tunde A.' }) displayName!: string;
  @ApiProperty() verified!: boolean;
}

export class ListingResponse {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ description: 'Whole naira', example: 385000 }) price!: number;
  @ApiProperty({ example: 'phones' }) category!: string;
  @ApiProperty({ enum: CONDITIONS }) condition!: ApiCondition;
  @ApiProperty({ example: 'Yaba' }) area!: string;
  @ApiProperty({ enum: DELIVERY_METHODS }) delivery!: ApiDelivery;
  @ApiProperty() description!: string;
  @ApiProperty() photoCount!: number;
  @ApiProperty({ type: [ListingImageResponse] }) images!: ListingImageResponse[];
  @ApiProperty() sellerId!: string;
  @ApiProperty({ type: SellerSummary }) seller!: SellerSummary;
  @ApiProperty({ nullable: true, type: String, format: 'date-time' }) postedAt!: string | null;
  @ApiProperty() status!: string;
  @ApiProperty() views!: number;
}

export class ListingPageResponse {
  @ApiProperty({ type: [ListingResponse] }) items!: ListingResponse[];
  @ApiProperty({ type: String, nullable: true }) nextCursor!: string | null;
}

function displayName(name: string) {
  const [first, last] = name.split(' ');
  return last ? `${first} ${last[0]}.` : first!;
}

export function toListingResponse(l: ListingWithRelations, mediaBaseUrl: string): ListingResponse {
  return {
    id: l.id,
    title: l.title,
    price: koboToNaira(l.priceKobo),
    category: l.category.slug,
    condition: toApiEnum<ApiCondition>(l.condition satisfies ListingCondition),
    area: l.area,
    delivery: toApiEnum<ApiDelivery>(l.delivery satisfies DeliveryMethod),
    description: l.description,
    photoCount: l.images.length,
    images: l.images.map((img) => ({ url: `${mediaBaseUrl}/${img.storageKey}`, width: img.width, height: img.height })),
    sellerId: l.sellerId,
    // Full name and contact details stay private; only a short display name is public.
    seller: {
      id: l.seller.id,
      username: l.seller.username,
      displayName: displayName(l.seller.name),
      verified: l.seller.idVerifiedAt !== null,
    },
    postedAt: l.publishedAt?.toISOString() ?? null,
    status: l.status,
    views: l.views,
  };
}
