import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { ApifyModule } from '../apify/apify.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [ActivityModule, ApifyModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
