import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { successResponse } from '../common/utils/api-response.util';
import { CommanderService } from './commander.service';

@Controller('commander/members')
@UseGuards(SessionAuthGuard)
export class CommanderController {
  constructor(private readonly commanderService: CommanderService) {}

  @Get()
  async listMembers(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: Record<string, unknown>,
  ) {
    const result = await this.commanderService.listMembers(
      currentUser.user.id,
      query,
    );
    return successResponse(result.items, undefined, result.meta);
  }

  @Get('by-unit')
  async listMembersByUnit(@CurrentUser() currentUser: AuthenticatedUser) {
    const result = await this.commanderService.listMembersByUnit(
      currentUser.user.id,
    );
    return successResponse(result);
  }

  @Get(':userId')
  async getMemberDetail(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('userId') userId: string,
    @Query() query: Record<string, unknown>,
  ) {
    const result = await this.commanderService.getMemberDetail(
      currentUser.user.id,
      userId,
      query,
    );
    return successResponse(result, undefined, result.meta);
  }
}
