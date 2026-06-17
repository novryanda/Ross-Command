import { Controller, Get } from '@nestjs/common';
import { successResponse } from '../common/utils/api-response.util';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return successResponse({ status: 'ok' });
  }
}
