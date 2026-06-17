import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { successResponse } from '../common/utils/api-response.util';
import { UnitsService } from './units.service';

@Controller('units')
@UseGuards(SessionAuthGuard, SuperAdminGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  async getTree() {
    const result = await this.unitsService.getTree();
    return successResponse(result);
  }

  @Post()
  async createUnit(@Body() body: unknown) {
    const result = await this.unitsService.createUnit(body);
    return successResponse(result, 'Satuan berhasil ditambahkan');
  }

  @Get(':unitId')
  async getUnit(@Param('unitId') unitId: string) {
    const result = await this.unitsService.getUnit(unitId);
    return successResponse(result);
  }

  @Patch(':unitId')
  async updateUnit(@Param('unitId') unitId: string, @Body() body: unknown) {
    const result = await this.unitsService.updateUnit(unitId, body);
    return successResponse(result, 'Satuan berhasil diperbarui');
  }

  @Delete(':unitId')
  async deleteUnit(@Param('unitId') unitId: string) {
    await this.unitsService.deleteUnit(unitId);
    return successResponse(null, 'Satuan berhasil dihapus');
  }

  @Post(':unitId/members')
  async assignMember(@Param('unitId') unitId: string, @Body() body: unknown) {
    const result = await this.unitsService.assignMember(unitId, body);
    return successResponse(result, 'Anggota berhasil di-assign ke satuan');
  }

  @Patch(':unitId/members/:userId/transfer')
  async transferMember(
    @Param('unitId') unitId: string,
    @Param('userId') userId: string,
    @Body() body: unknown,
  ) {
    const result = await this.unitsService.transferMember(unitId, userId, body);
    return successResponse(result, 'Anggota berhasil dipindahkan');
  }
}
