
import { AksiEksekusiType, SystemLogsDTO } from '@/dto/system.logs.dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SystemLogDocument = HydratedDocument<SystemLog>;

@Schema({
  // Otomatis membuat field createdAt dan updatedAt
  timestamps: true, 
})
export class SystemLog implements SystemLogsDTO {
  @Prop({
    required: true,
    trim: true,
  })
  status: string;

  @Prop({
    required: true,
    default: Date.now,
  })
  timestamp: Date;

  @Prop({
    required: true,
    trim: true,
  })
  pelakuActor: string;

  @Prop({
    required: true,
    type: String,
    enum: AksiEksekusiType, // Membatasi input hanya sesuai isi Enum Aksi
  })
  aksiEksekusi: AksiEksekusiType;

  @Prop({
    required: true,
    trim: true,
  })
  targetObject: string;

  @Prop({
    trim: true,
  })
  ipAddress: string;

  @Prop({
    trim: true,
  })
  detail: string;

  @Prop({
    trim: true,
  })
  supervisorOrCreatorName?: string;

  @Prop({
    trim: true,
  })
  username?: string;

  @Prop({
    trim: true,
  })
  usernameDiscord?: string;

  @Prop({
    trim: true,
  })
  usernameTelegram?: string;

  @Prop({
    trim: true,
  })
  usernameWhatsapp?: string;
}

export const SystemLogSchema = SchemaFactory.createForClass(SystemLog);
