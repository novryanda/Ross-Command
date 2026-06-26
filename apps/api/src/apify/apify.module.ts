import { Module } from '@nestjs/common';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { ApifyClient } from './apify.client';
import { ApifyService } from './apify.service';
import { ApifyWebhookController } from './apify.webhook.controller';

@Module({
  imports: [SystemSettingsModule],
  controllers: [ApifyWebhookController],
  providers: [ApifyClient, ApifyService],
  exports: [ApifyService],
})
export class ApifyModule {}
