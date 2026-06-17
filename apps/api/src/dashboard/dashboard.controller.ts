import { Controller, Get, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { successResponse } from '../common/utils/api-response.util';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('commander')
  @UseGuards(SessionAuthGuard)
  async getCommanderDashboard(@CurrentUser() currentUser: AuthenticatedUser) {
    const result = await this.dashboardService.getCommanderDashboard(
      currentUser.user.id,
    );
    return successResponse(result);
  }

  @Get('member')
  @UseGuards(SessionAuthGuard)
  async getMemberDashboard(@CurrentUser() currentUser: AuthenticatedUser) {
    const result = await this.dashboardService.getMemberDashboard(
      currentUser.user.id,
    );
    return successResponse(result);
  }

  @Get('admin')
  @UseGuards(SessionAuthGuard, SuperAdminGuard)
  async getAdminDashboard() {
    const result = await this.dashboardService.getAdminDashboard();
    return successResponse(result);
  }
}
