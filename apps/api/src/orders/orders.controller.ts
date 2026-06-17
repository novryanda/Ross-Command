import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import type { AuthenticatedUser } from '../auth/auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { successResponse } from '../common/utils/api-response.util';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(SessionAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async listOrders(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: Record<string, unknown>,
  ) {
    const result = await this.ordersService.listOrders(
      currentUser.user.id,
      query,
    );
    return successResponse(result.items, undefined, result.meta);
  }

  @Post()
  async createOrder(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const result = await this.ordersService.createOrder(
      currentUser.user.id,
      body,
    );
    return successResponse(result, 'Perintah berhasil dibuat');
  }

  @Get(':orderId')
  async getOrder(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('orderId') orderId: string,
  ) {
    const result = await this.ordersService.getOrderDetail(
      currentUser.user.id,
      orderId,
    );
    return successResponse(result);
  }

  @Patch(':orderId')
  async updateOrder(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Body() body: unknown,
  ) {
    const result = await this.ordersService.updateOrder(
      currentUser.user.id,
      orderId,
      body,
    );
    return successResponse(result, 'Perintah berhasil diperbarui');
  }

  @Post(':orderId/send')
  async sendOrder(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('orderId') orderId: string,
  ) {
    const result = await this.ordersService.sendOrder(
      currentUser.user.id,
      orderId,
    );
    return successResponse(result, 'Perintah berhasil dikirim');
  }

  @Post(':orderId/cancel')
  async cancelOrder(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('orderId') orderId: string,
  ) {
    await this.ordersService.cancelOrder(currentUser.user.id, orderId);
    return successResponse(null, 'Perintah berhasil dibatalkan');
  }

  @Get(':orderId/assignments')
  async listAssignments(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Query() query: Record<string, unknown>,
  ) {
    const result = await this.ordersService.listOrderAssignments(
      currentUser.user.id,
      orderId,
      query,
    );
    return successResponse(result.items, undefined, result.meta);
  }

  @Get(':orderId/assignments/by-unit')
  async listAssignmentsByUnit(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('orderId') orderId: string,
  ) {
    const result = await this.ordersService.listOrderAssignmentsByUnit(
      currentUser.user.id,
      orderId,
    );
    return successResponse(result);
  }

  @Get(':orderId/assignments/export')
  async exportAssignments(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const buffer = await this.ordersService.exportAssignments(
      currentUser.user.id,
      orderId,
    );

    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="order-${orderId}-progress.xlsx"`,
    );

    return Buffer.from(buffer);
  }
}
