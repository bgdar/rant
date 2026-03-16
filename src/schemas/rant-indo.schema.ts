// di sini data untuk Bot , pastikan sama dengan bot di discord dan telegra

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { RantDTO } from 'src/dto/dto';
export type CatDocument = HydratedDocument<RantIndo>;

@Schema()
export class RantIndo implements RantDTO {
  @Prop()
  name: string;
  @Prop()
  level: string;

  @Prop({ required: true })
  value: string[];
}

export const RantIndoSchema = SchemaFactory.createForClass(RantIndo);
