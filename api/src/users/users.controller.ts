import { Controller, Get } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiProperty, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { SessionUser } from '../auth/auth.js';
import { CurrentUser } from '../auth/decorators.js';
import { PrismaService } from '../prisma/prisma.service.js';

export class MeResponse {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'adaeze.o' }) username!: string;
  @ApiProperty({ example: 'Adaeze Okafor' }) name!: string;
  @ApiProperty({ example: '+2348034127790' }) phone!: string;
  @ApiProperty() phoneVerified!: boolean;
  @ApiProperty() email!: string;
  @ApiProperty() emailVerified!: boolean;
  @ApiProperty({ description: 'ID verified (the ✓ badge)' }) verified!: boolean;
  @ApiProperty({ nullable: true, type: String, example: 'Yaba' }) area!: string | null;
  @ApiProperty({ nullable: true, type: String }) bio!: string | null;
  @ApiProperty({ format: 'date-time' }) joinedAt!: string;
}

@ApiTags('users')
@ApiCookieAuth()
@Controller()
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  @ApiOkResponse({ type: MeResponse })
  @ApiUnauthorizedResponse({ description: 'Not signed in' })
  async me(@CurrentUser() sessionUser: SessionUser): Promise<MeResponse> {
    // Read fresh from the database; the session copy can be up to a day old.
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      email: user.email,
      emailVerified: user.emailVerified,
      verified: user.idVerifiedAt !== null,
      area: user.area,
      bio: user.bio,
      joinedAt: user.createdAt.toISOString(),
    };
  }
}
