import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ApifyModule } from '../apify/apify.module';
import { OrdersModule } from '../orders/orders.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot(), OrdersModule, ApifyModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
