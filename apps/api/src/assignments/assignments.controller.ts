import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { successResponse } from '../common/utils/api-response.util';
import { AssignmentsService } from './assignments.service';

@Controller('assignments/me')
@UseGuards(SessionAuthGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  async listAssignments(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: Record<string, unknown>,
  ) {
    const result = await this.assignmentsService.listAssignments(
      currentUser.user.id,
      query,
    );
    return successResponse(result.items, undefined, result.meta);
  }

  @Get(':assignmentId')
  async getAssignment(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('assignmentId') assignmentId: string,
  ) {
    const result = await this.assignmentsService.getAssignmentDetail(
      currentUser.user.id,
      assignmentId,
    );
    return successResponse(result);
  }

  @Post(':assignmentId/submit')
  async submitProof(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('assignmentId') assignmentId: string,
    @Body() body: unknown,
  ) {
    const result = await this.assignmentsService.submitProof(
      currentUser.user.id,
      assignmentId,
      body,
    );
    return successResponse(result, 'Bukti berhasil dikirim');
  }
}
