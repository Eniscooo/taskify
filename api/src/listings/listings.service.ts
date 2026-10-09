import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nairaToKobo } from '../common/money.js';
import { toPage, type Page } from '../common/pagination.js';
import type { Env } from '../config/env.js';
import { Prisma, type DeliveryMethod, type ListingCondition } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ListListingsQuery, ListingSort } from './dto/list-listings.query.js';
import { toDbEnum, toListingResponse, type ListingResponse } from './listing.mapper.js';

const listingInclude = {
  category: { select: { slug: true } },
  seller: { select: { id: true, username: true, name: true, idVerifiedAt: true } },
  images: { orderBy: { position: 'asc' }, select: { storageKey: true, width: true, height: true } },
} satisfies Prisma.ListingInclude;

export type ListingWithRelations = Prisma.ListingGetPayload<{ include: typeof listingInclude }>;

// Every sort ends with `id` so ordering is stable for cursor pagination.
const ORDER_BY: Record<ListingSort, Prisma.ListingOrderByWithRelationInput[]> = {
  recommended: [{ views: 'desc' }, { id: 'desc' }],
  newest: [{ publishedAt: 'desc' }, { id: 'desc' }],
  'price-asc': [{ priceKobo: 'asc' }, { id: 'asc' }],
  'price-desc': [{ priceKobo: 'desc' }, { id: 'desc' }],
};

/** Upper bound on full-text matches considered per query until OpenSearch is added. */
const MAX_SEARCH_MATCHES = 1000;

@Injectable()
export class ListingsService {
  private readonly mediaBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<Env, true>,
  ) {
    this.mediaBaseUrl = config.get('MEDIA_BASE_URL', { infer: true });
  }

  async list(query: ListListingsQuery): Promise<Page<ListingResponse>> {
    const where: Prisma.ListingWhereInput = { status: 'active' };

    if (query.q?.trim()) {
      where.id = { in: await this.searchIds(query.q.trim()) };
    }
    if (query.category) where.category = { slug: query.category };
    if (query.area) where.area = query.area;
    if (query.seller) where.seller = { username: query.seller };
    if (query.condition) where.condition = toDbEnum<ListingCondition>(query.condition);
    if (query.delivery) {
      // "both" listings satisfy either delivery preference.
      where.delivery = { in: [toDbEnum<DeliveryMethod>(query.delivery), 'both'] };
    }
    if (query.minPrice != null || query.maxPrice != null) {
      where.priceKobo = {
        ...(query.minPrice != null && { gte: nairaToKobo(query.minPrice) }),
        ...(query.maxPrice != null && { lte: nairaToKobo(query.maxPrice) }),
      };
    }

    const rows = await this.prisma.listing.findMany({
      where,
      include: listingInclude,
      orderBy: ORDER_BY[query.sort ?? 'recommended'],
      take: query.limit + 1,
      ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
    });

    return toPage(rows, query.limit, (l) => toListingResponse(l, this.mediaBaseUrl));
  }

  async findOne(id: string): Promise<ListingResponse> {
    const listing = await this.prisma.listing.findFirst({
      where: { id, status: { in: ['active', 'sold'] } },
      include: listingInclude,
    });
    if (!listing) throw new NotFoundException({ code: 'LISTING_NOT_FOUND', message: 'This listing is no longer available' });
    return toListingResponse(listing, this.mediaBaseUrl);
  }

  /** Uses the GIN index from the listing_full_text_search migration. */
  private async searchIds(q: string): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM listings
      WHERE status = 'active'
        AND to_tsvector('english', title || ' ' || description) @@ websearch_to_tsquery('english', ${q})
      LIMIT ${MAX_SEARCH_MATCHES}`;
    return rows.map((r) => r.id);
  }
}
