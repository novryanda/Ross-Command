import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { successResponse } from '../common/utils/api-response.util';
import { SocialAccountsService } from './social-accounts.service';

@Controller('social-accounts')
@UseGuards(SessionAuthGuard)
export class SocialAccountsController {
  constructor(private readonly socialAccountsService: SocialAccountsService) {}

  @Get()
  async listOwn(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: Record<string, unknown>,
  ) {
    const result = await this.socialAccountsService.listOwn(
      currentUser.user.id,
      query,
    );
    return successResponse(result);
  }

  @Post()
  async create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const result = await this.socialAccountsService.create(
      currentUser.user.id,
      body,
    );
    return successResponse(result, 'Akun sosial media berhasil ditambahkan');
  }

  @Patch(':socialAccountId')
  async update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('socialAccountId') socialAccountId: string,
    @Body() body: unknown,
  ) {
    const result = await this.socialAccountsService.update(
      currentUser.user.id,
      socialAccountId,
      body,
    );
    return successResponse(result, 'Akun sosial media berhasil diperbarui');
  }

  @Delete(':socialAccountId')
  async remove(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('socialAccountId') socialAccountId: string,
  ) {
    await this.socialAccountsService.remove(
      currentUser.user.id,
      socialAccountId,
    );
    return successResponse(null, 'Akun sosial media berhasil dihapus');
  }
}
