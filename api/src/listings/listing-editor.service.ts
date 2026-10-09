import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { koboToNaira, nairaToKobo } from '../common/money.js';
import type { Env } from '../config/env.js';
import type { DeliveryMethod, ListingCondition, ListingStatus, Prisma } from '../generated/prisma/client.js';
import { parsePhotoKey } from '../media/photo-key.js';
import { StorageService } from '../media/storage.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateListingDto, UpdateListingDto } from './dto/listing-input.dto.js';
import { toDbEnum, toListingResponse, type ListingResponse } from './listing.mapper.js';
import { listingInclude, type ListingWithRelations } from './listings.service.js';

const MIN_PRICE_NAIRA = 100;

/** The parts of a listing that must be filled in before it can go live. */
interface ListingContent {
  title: string;
  categoryId: string | null;
  condition: ListingCondition | null;
  delivery: DeliveryMethod | null;
  priceKobo: bigint;
  area: string;
  description: string;
  photoCount: number;
}

function publishProblems(c: ListingContent): { field: string; problems: string[] }[] {
  const checks: [string, boolean, string][] = [
    ['photos', c.photoCount >= 1, 'Add at least one photo.'],
    ['title', c.title.trim().length >= 5, 'Give your item a clear title (at least 5 characters).'],
    ['category', c.categoryId !== null, 'Choose a category.'],
    ['condition', c.condition !== null, "Choose the item's condition."],
    ['price', koboToNaira(c.priceKobo) >= MIN_PRICE_NAIRA, `Price must be at least ₦${MIN_PRICE_NAIRA}.`],
    ['area', c.area.trim() !== '', 'Choose where the item is.'],
    ['delivery', c.delivery !== null, 'Choose how the buyer gets the item.'],
    ['description', c.description.trim().length >= 20, 'Describe the item in at least 20 characters.'],
  ];
  return checks.filter(([, ok]) => !ok).map(([field, , message]) => ({ field, problems: [message] }));
}

/**
 * Creating and changing listings. Only the seller can change a listing, and
 * a listing can only be active or sold once every detail is filled in.
 */
@Injectable()
export class ListingEditorService {
  private readonly mediaBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    config: ConfigService<Env, true>,
  ) {
    this.mediaBaseUrl = config.get('MEDIA_BASE_URL', { infer: true });
  }

  /** The seller's listings in every status except removed, newest change first. */
  async listMine(sellerId: string): Promise<ListingResponse[]> {
    const rows = await this.prisma.listing.findMany({
      where: { sellerId, status: { not: 'removed' } },
      include: listingInclude,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: 200,
    });
    return rows.map((l) => this.toResponse(l));
  }

  async getMine(sellerId: string, id: string): Promise<ListingResponse> {
    return this.toResponse(await this.findMine(sellerId, id));
  }

  async create(sellerId: string, dto: CreateListingDto): Promise<ListingResponse> {
    const status = dto.status ?? 'active';
    const photos = await this.checkPhotos(sellerId, dto.photos ?? []);
    const content: ListingContent = {
      title: dto.title,
      categoryId: dto.category ? await this.categoryId(dto.category) : null,
      condition: dto.condition ? toDbEnum<ListingCondition>(dto.condition) : null,
      delivery: dto.delivery ? toDbEnum<DeliveryMethod>(dto.delivery) : null,
      priceKobo: nairaToKobo(dto.price ?? 0),
      area: dto.area ?? '',
      description: dto.description ?? '',
      photoCount: photos.length,
    };
    if (status === 'active') this.assertPublishable(content);

    const { photoCount: _, ...data } = content;
    const listing = await this.prisma.listing.create({
      data: {
        ...data,
        sellerId,
        negotiable: dto.negotiable ?? true,
        status,
        publishedAt: status === 'active' ? new Date() : null,
        images: { create: photos },
      },
      include: listingInclude,
    });
    return this.toResponse(listing);
  }

  async update(sellerId: string, id: string, dto: UpdateListingDto): Promise<ListingResponse> {
    const existing = await this.findMine(sellerId, id);
    if (existing.status === 'flagged') {
      throw new ConflictException({
        code: 'LISTING_UNDER_REVIEW',
        message: "Our team is reviewing this listing, so it can't be changed right now.",
      });
    }
    const status: ListingStatus = dto.status ?? existing.status;
    if (status === 'sold' && existing.status === 'draft') {
      throw new ConflictException({ code: 'INVALID_STATUS', message: 'Publish the listing before marking it sold.' });
    }

    const photos = dto.photos ? await this.checkPhotos(sellerId, dto.photos) : null;
    const content: ListingContent = {
      title: dto.title ?? existing.title,
      categoryId: dto.category !== undefined ? await this.categoryId(dto.category) : existing.categoryId,
      condition: dto.condition !== undefined ? toDbEnum<ListingCondition>(dto.condition) : existing.condition,
      delivery: dto.delivery !== undefined ? toDbEnum<DeliveryMethod>(dto.delivery) : existing.delivery,
      priceKobo: dto.price !== undefined ? nairaToKobo(dto.price) : existing.priceKobo,
      area: dto.area ?? existing.area,
      description: dto.description ?? existing.description,
      photoCount: photos ? photos.length : existing.images.length,
    };
    if (status !== 'draft') this.assertPublishable(content);

    const { photoCount: _, ...data } = content;
    const listing = await this.prisma.$transaction(async (tx) => {
      if (photos) await tx.listingImage.deleteMany({ where: { listingId: id } });
      return tx.listing.update({
        where: { id },
        data: {
          ...data,
          ...(dto.negotiable !== undefined && { negotiable: dto.negotiable }),
          status,
          // First time it goes live.
          ...(status === 'active' && !existing.publishedAt && { publishedAt: new Date() }),
          ...(photos && { images: { create: photos } }),
        },
        include: listingInclude,
      });
    });
    return this.toResponse(listing);
  }

  /** Takes the listing down for good. It disappears from search and from the seller's list. */
  async remove(sellerId: string, id: string): Promise<void> {
    const { count } = await this.prisma.listing.updateMany({
      where: { id, sellerId, status: { not: 'removed' } },
      data: { status: 'removed' },
    });
    if (count === 0) throw this.notFound();
  }

  private async findMine(sellerId: string, id: string) {
    // Other sellers' listings look the same as missing ones.
    const listing = await this.prisma.listing.findFirst({
      where: { id, sellerId, status: { not: 'removed' } },
      include: listingInclude,
    });
    if (!listing) throw this.notFound();
    return listing;
  }

  private notFound() {
    return new NotFoundException({ code: 'LISTING_NOT_FOUND', message: "We couldn't find that listing" });
  }

  private assertPublishable(content: ListingContent) {
    const details = publishProblems(content);
    if (details.length) {
      throw new BadRequestException({
        code: 'LISTING_INCOMPLETE',
        message: 'Fill in the missing details to publish this listing',
        details,
      });
    }
  }

  private async categoryId(slug: string): Promise<string> {
    const category = await this.prisma.category.findUnique({ where: { slug }, select: { id: true } });
    if (!category) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'Some fields are invalid',
        details: [{ field: 'category', problems: ['Choose a category from the list.'] }],
      });
    }
    return category.id;
  }

  /** Photos must be this seller's uploads and still exist. Returns image rows in order. */
  private async checkPhotos(sellerId: string, keys: string[]): Promise<Prisma.ListingImageCreateWithoutListingInput[]> {
    const unique = [...new Set(keys)];
    const images = await Promise.all(
      unique.map(async (key, position) => {
        const parsed = parsePhotoKey(key);
        if (!parsed || parsed.userId !== sellerId || !(await this.storage.exists(key))) return null;
        return { storageKey: key, position, width: parsed.width, height: parsed.height };
      }),
    );
    if (images.some((img) => img === null)) {
      throw new BadRequestException({
        code: 'INVALID_PHOTO',
        message: 'One of the photos is missing. Remove it and upload it again.',
      });
    }
    return images as Prisma.ListingImageCreateWithoutListingInput[];
  }

  private toResponse(listing: ListingWithRelations): ListingResponse {
    return toListingResponse(listing, this.mediaBaseUrl);
  }
}
