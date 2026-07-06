import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserDbService } from './user.db.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { SupervisorModule } from 'src/supervisor.module/supervisor.module.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    // externam provider & service
    SupervisorModule
  ],

  controllers: [UserController],
  providers: [UserDbService],
})
export class UserModule {}
