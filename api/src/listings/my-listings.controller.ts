import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { SessionUser } from '../auth/auth.js';
import { CurrentUser } from '../auth/decorators.js';
import { ListingEditorService } from './listing-editor.service.js';
import { ListingResponse } from './listing.mapper.js';

/** The signed-in seller's own listings, including drafts and sold ones. */
@ApiTags('listings')
@ApiCookieAuth()
@Controller('me/listings')
export class MyListingsController {
  constructor(private readonly editor: ListingEditorService) {}

  @Get()
  @ApiOkResponse({ type: [ListingResponse] })
  list(@CurrentUser() user: SessionUser) {
    return this.editor.listMine(user.id);
  }

  @Get(':id')
  @ApiOkResponse({ type: ListingResponse })
  findOne(@CurrentUser() user: SessionUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.editor.getMine(user.id, id);
  }
}
