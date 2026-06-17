import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { EmailService } from './email.service';
import { HierarchyService } from './hierarchy.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  ],
  providers: [PrismaService, EmailService, HierarchyService],
  exports: [
    PrismaService,
    EmailService,
    HierarchyService,
    WinstonModule,
    ConfigModule,
  ],
})
export class CommonModule {}
