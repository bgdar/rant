import { Module } from '@nestjs/common';
import { SupervisorController } from './supervisor.controller';
import { DbSystemLogMessageService } from './db.system.log.message.service';

@Module({
  controllers: [SupervisorController],
  providers: [
    // apa yg mebuat lifcecler depedency dari service ini
    // DbSystemLogMessageService
  ],
})
export class SupervisorModule {}
