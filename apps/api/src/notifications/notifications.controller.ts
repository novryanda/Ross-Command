import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { successResponse } from '../common/utils/api-response.util';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(SessionAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async listNotifications(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('limit') limit?: string,
  ) {
    const result = await this.notificationsService.listNotifications(
      currentUser.user.id,
      Number(limit) || 20,
    );

    return successResponse(result.items, undefined, {
      unreadCount: result.unreadCount,
      generatedAt: result.generatedAt,
    });
  }

  @Get('summary')
  async getSummary(@CurrentUser() currentUser: AuthenticatedUser) {
    const result = await this.notificationsService.listNotifications(
      currentUser.user.id,
      12,
    );

    return successResponse({
      unreadCount: result.unreadCount,
      generatedAt: result.generatedAt,
    });
  }

  @Post('mark-all-read')
  markAllRead() {
    return successResponse(null, 'Notifikasi ditandai sudah dibaca');
  }
}
