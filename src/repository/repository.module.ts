import { Global, Module } from '@nestjs/common';

import { ForumisRepository } from './forumis.repository';
import { GroupMessageForumisRepository } from './group.message.forumis.repository';
import { ChatMessageForumisRepository } from './chat.message.forumis.repository';
import { SupervisorRepository } from './supervisor.repository';
import { UserRepository } from './user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Forumis, ForumisSchema } from '@/schemas/forumis.schema';
import {
  RantKeywordIndo,
  RantKeywordIndoSchema,
} from '@/schemas/rant-keyword-indo.schema';
import { Supervisor, SupervisorSchema } from '@/schemas/supervisor.schema';
import { User, UserSchema } from '@/schemas/user.schema';
import {
  ChatMessageForumis,
  ChatMessageForumisSchema,
} from '@/schemas/chat.message.forumis.schema';
import {
  GroupMessageForumisSchema,
  GroupMessageForumis,
} from '@/schemas/group.message.forumis.schema';
import { SystemLog, SystemLogSchema } from '@/schemas/system.logs.schema';

// Global : karenana akan di guankan di banyak module
@Global()
@Module({
  imports: [
    // ini adalah migrasi baru , menjadikan aplikasi independent
    MongooseModule.forFeature([
      // gak saya pakai dulu , karena ini cara lama
      // { name: RantKeywordIndo.name, schema: RantKeywordIndoSchema },
      // {name : RantKeywordAceh.name , schema : RantKeywordAcehSchema},

      { name: Forumis.name, schema: ForumisSchema },
      { name: RantKeywordIndo.name, schema: RantKeywordIndoSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
      { name: User.name, schema: UserSchema },
      { name: ChatMessageForumis.name, schema: ChatMessageForumisSchema },
      { name: GroupMessageForumis.name, schema: GroupMessageForumisSchema },
      { name: SystemLog.name, schema: SystemLogSchema },
    ]),
  ],

  providers: [
    ForumisRepository,
    GroupMessageForumisRepository,
    ChatMessageForumisRepository,
    SupervisorRepository,
    UserRepository,
  ],

  exports: [
    ForumisRepository,
    GroupMessageForumisRepository,
    ChatMessageForumisRepository,
    SupervisorRepository,
    UserRepository,
  ],
})
export class RepositoryModule {}
