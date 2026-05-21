// di sini data untuk Bot , pastikan sama dengan bot di discord dan telegra

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { RantKeywordDTO } from 'src/dto/dataDTO';
export type RantKeywordIndoDocument = HydratedDocument<RantKeywordIndo>;

@Schema()
export class RantKeywordIndo implements RantKeywordDTO {
  @Prop()
  name: string;
  @Prop()
  level: string;

  @Prop({ required: true })
  value: string[];
}

export const RantKeywordIndoSchema =
  SchemaFactory.createForClass(RantKeywordIndo);
