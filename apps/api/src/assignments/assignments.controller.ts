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

@Controller('orders')
@UseGuards(SessionAuthGuard)
export class AssignmentRepresentedController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post(':orderId/assignments/:assignmentId/submit')
  async submitRepresentedProof(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() body: unknown,
  ) {
    const result = await this.assignmentsService.submitRepresentedProof(
      currentUser.user.id,
      orderId,
      assignmentId,
      body,
    );
    return successResponse(result, 'Bukti anggota berhasil dikirim');
  }

  @Get(':orderId/bulk-submission')
  async listBulkSubmissionAssignments(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Query() query: Record<string, unknown>,
  ) {
    const result = await this.assignmentsService.listBulkSubmissionAssignments(
      currentUser.user.id,
      orderId,
      query,
    );
    return successResponse(result);
  }

  @Post(':orderId/bulk-submission')
  async bulkSubmitProof(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Body() body: unknown,
  ) {
    const result = await this.assignmentsService.bulkSubmitProof(
      currentUser.user.id,
      orderId,
      body,
    );
    return successResponse(result, 'Bulk submission berhasil diproses');
  }
}
