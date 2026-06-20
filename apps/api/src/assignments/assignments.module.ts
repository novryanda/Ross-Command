import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { OrdersModule } from '../orders/orders.module';
import {
  AssignmentRepresentedController,
  AssignmentsController,
} from './assignments.controller';
import { AssignmentsService } from './assignments.service';

@Module({
  imports: [OrdersModule, ActivityModule],
  controllers: [AssignmentsController, AssignmentRepresentedController],
  providers: [AssignmentsService],
})
export class AssignmentsModule {}
