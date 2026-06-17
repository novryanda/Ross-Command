import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { HierarchyService } from '../common/hierarchy.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { PrismaService } from '../common/prisma.service';
import { ApiException } from '../common/utils/api-exception.util';
import { successResponse } from '../common/utils/api-response.util';
import { AuthService } from './auth.service';
import { resetPasswordSchema, unlockUserSchema, updateProfileSchema } from './auth.schema';
import type { AuthenticatedUser } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly hierarchyService: HierarchyService,
  ) {}

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async me(@CurrentUser() currentUser: AuthenticatedUser) {
    const membership = await this.hierarchyService.getActiveMembership(
      currentUser.user.id,
    );
    const commandingUnits = await this.hierarchyService.getCommandingUnits(
      currentUser.user.id,
    );
    const socialAccountCount = await this.prisma.socialAccount.count({
      where: {
        userId: currentUser.user.id,
        deletedAt: null,
      },
    });

    return successResponse({
      id: currentUser.user.id,
      username: currentUser.user.username,
      fullName: currentUser.user.fullName,
      nip: currentUser.user.nip,
      role: currentUser.user.role,
      isCommander: commandingUnits.length > 0,
      unit: membership
        ? {
            id: membership.unit.id,
            name: membership.unit.name,
            path: membership.unit.path,
            depthLevel: membership.unit.depthLevel,
          }
        : null,
      commandingUnits: commandingUnits.map((unit) => ({
        id: unit.id,
        name: unit.name,
        path: unit.path,
        depthLevel: unit.depthLevel,
      })),
      socialAccountCount,
      lastLoginAt: currentUser.user.lastLoginAt,
      createdAt: currentUser.user.createdAt,
    });
  }

  @Patch('me')
  @UseGuards(SessionAuthGuard)
  async updateMe(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const parsed = updateProfileSchema.parse(body);
    const normalizedUsername = parsed.username.toLowerCase();

    const duplicate = await this.prisma.user.findFirst({
      where: {
        username: normalizedUsername,
        deletedAt: null,
        NOT: { id: currentUser.user.id },
      },
    });

    if (duplicate) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'CONFLICT',
        'Username sudah digunakan',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: currentUser.user.id },
        data: {
          fullName: parsed.fullName,
          username: normalizedUsername,
          displayUsername: normalizedUsername,
          nip: parsed.nip ?? null,
          email: `${normalizedUsername}@internal.komando`,
        },
      });

      await tx.account.updateMany({
        where: {
          userId: currentUser.user.id,
          providerId: 'username',
        },
        data: {
          accountId: normalizedUsername,
        },
      });
    });

    return this.me(currentUser);
  }

  @Post('admin/unlock-user')
  @UseGuards(SessionAuthGuard, SuperAdminGuard)
  async unlockUser(@Req() request: Request, @Body() body: unknown) {
    const parsed = unlockUserSchema.parse(body);
    await this.authService.requireUser(request.headers, {
      disableCookieCache: true,
    });

    await this.prisma.user.update({
      where: { id: parsed.userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    return successResponse(null, 'Akun user berhasil dibuka');
  }

  @Patch('admin/reset-password')
  @UseGuards(SessionAuthGuard, SuperAdminGuard)
  async resetPassword(@Req() request: Request, @Body() body: unknown) {
    const parsed = resetPasswordSchema.parse(body);
    await this.authService.requireUser(request.headers, {
      disableCookieCache: true,
    });
    const auth = await this.authService.getAuth();

    await auth.api.setUserPassword({
      headers: this.authService.toHeaders(request.headers),
      body: {
        userId: parsed.userId,
        newPassword: parsed.newPassword,
      },
    });

    await this.prisma.user.update({
      where: { id: parsed.userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    return successResponse(null, 'Password user berhasil direset');
  }
}
