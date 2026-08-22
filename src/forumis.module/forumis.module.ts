import { Module } from '@nestjs/common';
import { ChatMessageForumisController } from './chat.message.forumis.controller';
import { GroupMessageForumisController } from './group.message.forumis.controller';
import { ForumsController } from './forumis.controller';

@Module({
  controllers: [
    ChatMessageForumisController,
    GroupMessageForumisController,
    ForumsController,
  ],
})
export class ForumisModule {}
