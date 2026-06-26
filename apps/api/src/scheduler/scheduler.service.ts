import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import { ApifyService } from '../apify/apify.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly apifyService: ApifyService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleDeadlineScrapesAndExpiry() {
    const now = new Date();

    const orders = await this.prisma.order.findMany({
      where: {
        orderType: 'engagement',
        status: { in: ['aktif', 'selesai'] },
        deadline: { lt: now },
        deletedAt: null,
      },
      select: {
        id: true,
        socialTargets: {
          select: {
            id: true,
            metricScrapeRuns: {
              where: { phase: 'deadline', status: 'succeeded' },
              select: { id: true },
            },
          },
        },
      },
      take: 50,
    });

    for (const order of orders) {
      try {
        await this.ordersService.refreshOrderStatus(order.id);

        const needsDeadlineScrape = order.socialTargets.some(
          (target) => target.metricScrapeRuns.length === 0,
        );

        if (needsDeadlineScrape) {
          await this.apifyService.triggerDeadlineScrape(order.id);
        }
      } catch (error) {
        this.logger.warn(
          `Scheduler failed for order ${order.id}: ${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }

    await this.apifyService.pollRunningScrapeRuns();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async pollApifyRunningScrapes() {
    await this.apifyService.pollRunningScrapeRuns();
  }
}
