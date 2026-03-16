import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { UserDTO } from 'src/dto/dto';
export type CatDocument = HydratedDocument<User>;

@Schema()
export class User implements UserDTO {
  @Prop()
  name: string;
  @Prop()
  password: string;
  @Prop()
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
