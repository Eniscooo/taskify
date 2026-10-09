import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListListingsQuery } from './dto/list-listings.query.js';
import { ListingPageResponse, ListingResponse } from './listing.mapper.js';
import { ListingsService } from './listings.service.js';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  @Get()
  @ApiOkResponse({ type: ListingPageResponse })
  list(@Query() query: ListListingsQuery) {
    return this.listings.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: ListingResponse })
  @ApiNotFoundResponse({ description: 'Listing does not exist, is a draft, or was removed' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.listings.findOne(id);
  }
}
