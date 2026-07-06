import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ForumsController } from './forums.controller';
import { ForumsGateway } from './forums.gateway';
import { ConfigModule } from '@nestjs/config';
import { ForumsDbService } from './forums.db.service';
// import { Auth } from 'src/middleware/auth';
import { MongooseModule } from '@nestjs/mongoose';
import { Forum, ForumSchema } from 'src/schemas/forum.schema';
import { Chat, ChatSchema } from 'src/schemas/chat.schema';
import { ChatController } from './chat.controller';
import { SupervisorModule } from 'src/supervisor.module/supervisor.module.module';

@Module({
  imports: [
    ConfigModule, // ada yang baca .env  dan gak hanya itu
    MongooseModule.forFeature([
      { name: Forum.name, schema: ForumSchema },
      { name: Chat.name, schema: ChatSchema },
    ]),

    // Module terpisah
    SupervisorModule,
  ],

  controllers: [ForumsController, ChatController],
  providers: [ForumsGateway, ForumsDbService],
})
export class ForumsModule {}
