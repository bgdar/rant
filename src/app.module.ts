import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

// semua shcemma database
import { Forumis, ForumisSchema } from 'src/schemas/forumis.schema';
import {
  RantKeywordIndo,
  RantKeywordIndoSchema,
} from './schemas/rant-keyword-indo.schema';
import { SupervisorSchema, Supervisor } from './schemas/supervisor.schema';
import { UserSchema, User } from './schemas/user.schema';
import {
  ChatMessageForumis,
  ChatMessageForumisSchema,
} from './schemas/chat.message.forumis.schema';
import {
  GroupMessageForumis,
  GroupMessageForumisSchema,
} from './schemas/group.message.forumis.schema';

import { MongooseModule } from '@nestjs/mongoose';
// import { SeederModule } from './seeder.module/seeder.module';
import { MongoCongigService } from './mongo-config.service';
import { ConfigModule } from '@nestjs/config';
import { GatewayModule } from './gateway/gateway.module';
import { RepositoryModule } from './repository/repository.module';
import { UserModule } from './user.module/user.module';
import { SupervisorModule } from './supervisor.module/supervisor.module';
import { ForumisModule } from './forumis.module/forumis.module';
import { RantModule } from './rant.module/rant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // WAJIB: Agar ConfigService bisa dipakai di semua controller/service tanpa perlu di-import berulang kali
    }),
    // kalau db rant gak ada maka otomatis di buat
    MongooseModule.forRootAsync({
      useClass: MongoCongigService,
    }),
    // ini adalah migrasi baru , menjadikan aplikasi independent
    MongooseModule.forFeature([
      { name: Forumis.name, schema: ForumisSchema },
      { name: RantKeywordIndo.name, schema: RantKeywordIndoSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
      { name: User.name, schema: UserSchema },
      { name: ChatMessageForumis.name, schema: ChatMessageForumisSchema },
      { name: GroupMessageForumis.name, schema: GroupMessageForumisSchema },
    ]),

    GatewayModule,
    RepositoryModule,

    // ----module utama -----

    UserModule,
    SupervisorModule,
    ForumisModule,
    RantModule,
    // SeederModule,
  ],
  // kelola di mosule module di bawahnya aja , kecuali yang secara global butuh
  controllers: [AppController],
  providers: [],
  // providers: [AppService],
})
export class AppModule {}
