import { Module } from '@nestjs/common';
import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { CommonModule } from './common/common.module';
import { CommanderModule } from './commander/commander.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { SocialAccountsModule } from './social-accounts/social-accounts.module';
import { UnitsModule } from './units/units.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    CommonModule,
    ActivityModule,
    AuthModule,
    UsersModule,
    UnitsModule,
    SocialAccountsModule,
    OrdersModule,
    AssignmentsModule,
    DashboardModule,
    CommanderModule,
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
