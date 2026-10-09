import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';

class CategoryResponse {
  @ApiProperty({ example: 'phones' }) slug!: string;
  @ApiProperty({ example: 'Phones' }) name!: string;
}

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOkResponse({ type: [CategoryResponse] })
  list(): Promise<CategoryResponse[]> {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, select: { slug: true, name: true } });
  }
}
