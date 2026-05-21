import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { UserDTO } from 'src/dto/user.dto';
export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User implements UserDTO {
  @Prop({
    required: true,
    trim: true,
  })
  username: string;
  @Prop()
  password: string;
  @Prop()
  email: string;

  @Prop({
    default: 'Normal',
    enum: ['Normal', 'Suspicious', 'Dangerous', 'Extreme'],
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
