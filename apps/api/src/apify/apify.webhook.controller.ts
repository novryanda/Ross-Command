import { Body, Controller, Post, Query } from '@nestjs/common';
import { successResponse } from '../common/utils/api-response.util';
import { ApifyService } from './apify.service';

@Controller('webhooks/apify')
export class ApifyWebhookController {
  constructor(private readonly apifyService: ApifyService) {}

  @Post()
  async handleWebhook(
    @Query('token') token: string | undefined,
    @Body() body: unknown,
  ) {
    const result = await this.apifyService.processWebhook(token, body);
    return successResponse(result);
  }
}
