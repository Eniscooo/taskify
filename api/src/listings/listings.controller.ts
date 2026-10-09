import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { SessionUser } from '../auth/auth.js';
import { CurrentUser, Public } from '../auth/decorators.js';
import { CreateListingDto, UpdateListingDto } from './dto/listing-input.dto.js';
import { ListListingsQuery } from './dto/list-listings.query.js';
import { ListingEditorService } from './listing-editor.service.js';
import { ListingPageResponse, ListingResponse } from './listing.mapper.js';
import { ListingsService } from './listings.service.js';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listings: ListingsService,
    private readonly editor: ListingEditorService,
  ) {}

  @Public()
  @Get()
  @ApiOkResponse({ type: ListingPageResponse })
  list(@Query() query: ListListingsQuery) {
    return this.listings.list(query);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ type: ListingResponse })
  @ApiNotFoundResponse({ description: 'Listing does not exist, is a draft, or was removed' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.listings.findOne(id);
  }

  @Post()
  @ApiCookieAuth()
  @ApiCreatedResponse({ type: ListingResponse })
  @ApiBadRequestResponse({ description: 'LISTING_INCOMPLETE when publishing with missing details' })
  create(@CurrentUser() user: SessionUser, @Body() dto: CreateListingDto) {
    return this.editor.create(user.id, dto);
  }

  /** Edit, publish a draft, mark sold or relist. Seller only. */
  @Patch(':id')
  @ApiCookieAuth()
  @ApiOkResponse({ type: ListingResponse })
  update(
    @CurrentUser() user: SessionUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateListingDto,
  ) {
    return this.editor.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiCookieAuth()
  @ApiNoContentResponse({ description: 'Removed' })
  remove(@CurrentUser() user: SessionUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.editor.remove(user.id, id);
  }
}
