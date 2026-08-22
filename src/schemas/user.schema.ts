import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { UserDTO, UserRole } from 'src/dto/user.dto';
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

  @Prop()
  discordId: string;

  @Prop()
  telegramId: string;

  @Prop() 
  whatsappId: string; 

  @Prop({
    default: 'Normal',
    enum: [UserRole],
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
