import { Module } from '@nestjs/common';
import { CommanderController } from './commander.controller';
import { CommanderService } from './commander.service';

@Module({
  controllers: [CommanderController],
  providers: [CommanderService],
})
export class CommanderModule {}
