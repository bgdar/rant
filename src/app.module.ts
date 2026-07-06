import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { MongooseModule } from '@nestjs/mongoose';
// import { SeederModule } from './seeder.module/seeder.module';
import { ForumsModule } from './forums.module/forums.module';

// gak pake dulu
// import { RantModule } from './rant.module/rant.module';
import { UserModule } from './user.module/user.module';
import { MongoCongigService } from './mongo-congig.service';
import { SupervisorModule } from './supervisor.module/supervisor.module.module';

@Module({
  imports: [
    // kalau db rant gak ada maka otomatis di buat
    MongooseModule.forRootAsync({
      useClass: MongoCongigService,
    }),
    // MongooseModule.forFeature([{ name: Rant.name, schema: RantSchema }]),
    ForumsModule,
    UserModule,

    // ----matikan sementar - ----
    // RantModule,
    SupervisorModule,

    // SeederModule,
  ],
  // kelola di mosule module di bawahnya aja , kecuali yang secara global butuh
  controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
