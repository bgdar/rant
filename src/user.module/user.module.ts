import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserDbService } from './user.db.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],

  controllers: [UserController],
  providers: [UserDbService],
})
export class UserModule {}
