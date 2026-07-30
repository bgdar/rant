import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { MongooseModule } from '@nestjs/mongoose';
// import { SeederModule } from './seeder.module/seeder.module';
import { ForumisModule } from './forumis.module/forumis.module';
import { UserModule } from './user.module/user.module';
import { MongoCongigService } from './mongo-congig.service';
import { SupervisorModule } from './supervisor.module/supervisor.module.module';
import { RantModule } from './rant.module/rant.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // WAJIB: Agar ConfigService bisa dipakai di semua controller/service tanpa perlu di-import berulang kali
    }),
    // kalau db rant gak ada maka otomatis di buat
    MongooseModule.forRootAsync({
      useClass: MongoCongigService,
    }),
    // MongooseModule.forFeature([{ name: Rant.name, schema: RantSchema }]),

    UserModule,
    RantModule,

    // ForumisModule,    // ----matikan sementar - ----
    // SupervisorModule,
    // SeederModule,
  ],
  // kelola di mosule module di bawahnya aja , kecuali yang secara global butuh
  controllers: [AppController],
  providers: [],
  // providers: [AppService],
})
export class AppModule {}
