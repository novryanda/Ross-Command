import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { successResponse } from '../common/utils/api-response.util';
import type { AuthenticatedUser } from '../auth/auth.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(SessionAuthGuard, SuperAdminGuard)
  async listUsers(@Query() query: Record<string, unknown>) {
    const result = await this.usersService.listUsers(query);
    return successResponse(result.items, undefined, result.meta);
  }

  @Post()
  @UseGuards(SessionAuthGuard, SuperAdminGuard)
  async createUser(@Req() request: Request, @Body() body: unknown) {
    const result = await this.usersService.createUser(request.headers, body);
    return successResponse(result, 'User berhasil ditambahkan');
  }

  @Get(':userId')
  @UseGuards(SessionAuthGuard, SuperAdminGuard)
  async getUser(@Param('userId') userId: string) {
    const result = await this.usersService.getUserById(userId);
    return successResponse(result);
  }

  @Patch(':userId')
  @UseGuards(SessionAuthGuard, SuperAdminGuard)
  async updateUser(@Param('userId') userId: string, @Body() body: unknown) {
    const result = await this.usersService.updateUser(userId, body);
    return successResponse(result, 'User berhasil diperbarui');
  }

  @Delete(':userId')
  @UseGuards(SessionAuthGuard, SuperAdminGuard)
  async deleteUser(@Param('userId') userId: string) {
    await this.usersService.deactivateUser(userId);
    return successResponse(null, 'User berhasil dinonaktifkan');
  }

  @Get(':userId/social-accounts')
  @UseGuards(SessionAuthGuard)
  async getUserSocialAccounts(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('userId') userId: string,
  ) {
    const result = await this.usersService.getUserSocialAccounts(
      currentUser.user.id,
      userId,
    );
    return successResponse(result);
  }
}
