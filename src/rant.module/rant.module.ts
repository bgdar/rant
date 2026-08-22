import { Module } from '@nestjs/common';
import { SosmedController } from './sosmed.controller';
import { RantController } from './rant.controller';

@Module({
  controllers: [SosmedController, RantController],
})
export class RantModule {}
