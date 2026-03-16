import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederModule } from './seeder.module/seeder.module';
import { RantModule } from './rant.module/rant.module';
import { ForumsModule } from './forums.module/forums.module';

@Module({
  imports: [
    // kalau db rant gak ada maka otomatis di buat
    MongooseModule.forRoot('mongodb://localhost/rant'),

    // MongooseModule.forFeature([{ name: Rant.name, schema: RantSchema }]),
    SeederModule,
    RantModule,
    ForumsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
