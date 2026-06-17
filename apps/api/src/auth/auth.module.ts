import { Global, Module } from '@nestjs/common';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionAuthGuard, SuperAdminGuard],
  exports: [AuthService, SessionAuthGuard, SuperAdminGuard],
})
export class AuthModule {}
