import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { successResponse } from '../common/utils/api-response.util';
import { ActivityService } from './activity.service';

@Controller('activity')
@UseGuards(SessionAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async listActivity(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: Record<string, unknown>,
  ) {
    const result = await this.activityService.listActivity(
      currentUser.user,
      query,
    );

    return successResponse(result.items, undefined, {
      ...result.meta,
      generatedAt: result.generatedAt,
    });
  }
}
