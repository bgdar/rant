import { Module } from '@nestjs/common';
import { ForumsController } from './forums.controller';

@Module({
  controllers: [ForumsController],
})
export class ForumsModule {}
