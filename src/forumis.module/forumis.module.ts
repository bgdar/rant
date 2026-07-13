import { Module} from '@nestjs/common';
import { ForumsController } from './forumis.controller';
import { ForumsGateway } from './forumis.gateway';
import { ConfigModule } from '@nestjs/config';
import { ForumsDbService } from './forumis.db.service';
// import { Auth } from 'src/middleware/auth';
import { MongooseModule } from '@nestjs/mongoose';
import { Forumis, ForumisSchema } from 'src/schemas/forumis.schema';
import { Chat, ChatSchema } from 'src/schemas/chat.schema';
import { Group, GroupSchema } from 'src/schemas/group.schema';

import { ChatController } from './chat.controller';
import { SupervisorModule } from 'src/supervisor.module/supervisor.module.module';
import { GroupController } from './group.controller';
import { ChatDbService } from './chat.db.service';
import { GroupDbService } from './group.db.service';
import { UserModule } from 'src/user.module/user.module';
import { RantModule } from 'src/rant.module/rant.module';

@Module({
  imports: [
    ConfigModule, // ada yang baca .env  dan gak hanya itu
    MongooseModule.forFeature([
      { name: Forumis.name, schema: ForumisSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: Group.name, schema: GroupSchema },
    ]),

    // Module terpisah
    SupervisorModule,
    UserModule,

    RantModule,
  ],

  controllers: [ForumsController, ChatController, GroupController],
  providers: [ForumsGateway, ForumsDbService, ChatDbService, GroupDbService],
})
export class ForumisModule {}
