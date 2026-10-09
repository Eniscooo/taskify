import { Module } from '@nestjs/common';
import { ListingEditorService } from './listing-editor.service.js';
import { ListingsController } from './listings.controller.js';
import { ListingsService } from './listings.service.js';
import { MyListingsController } from './my-listings.controller.js';

@Module({
  controllers: [ListingsController, MyListingsController],
  providers: [ListingsService, ListingEditorService],
  exports: [ListingsService],
})
export class ListingsModule {}
