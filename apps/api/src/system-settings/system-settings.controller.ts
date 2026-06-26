import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { successResponse } from '../common/utils/api-response.util';
import type { AuthenticatedUser } from '../auth/auth.service';
import { SystemSettingsService } from './system-settings.service';

@Controller('admin/system-settings')
@UseGuards(SessionAuthGuard, SuperAdminGuard)
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get()
  async getSettings() {
    const result = await this.systemSettingsService.getSettings();
    return successResponse(result);
  }

  @Put()
  async updateSettings(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const result = await this.systemSettingsService.updateSettings(
      currentUser.user.id,
      body,
    );
    return successResponse(result, 'Konfigurasi sistem berhasil disimpan');
  }

  @Post('test-apify')
  async testApify(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const result = await this.systemSettingsService.testApifyConnection(
      currentUser.user.id,
      body,
    );
    return successResponse(result, 'Koneksi Apify berhasil');
  }
}
