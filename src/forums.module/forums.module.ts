import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ForumsController } from './forums.controller';
import { ForumsGateway } from './forums.gateway';

import { ForumsDbService } from './forums.db.service';
// import { Auth } from 'src/middleware/auth';
import { MongooseModule } from '@nestjs/mongoose';
import { Forum, ForumSchema } from 'src/schemas/forum.schema';
import { Chat, ChatSchema } from 'src/schemas/chat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Forum.name, schema: ForumSchema },
      { name: Chat.name, schema: ChatSchema },
    ]),
  ],

  controllers: [ForumsController],
  providers: [ForumsGateway, ForumsDbService],
})
export class ForumsModule {}
