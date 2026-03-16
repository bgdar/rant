import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { RantDTO } from 'src/dto/dto';
export type CatDocument = HydratedDocument<RantAceh>;

@Schema()
export class RantAceh implements RantDTO {
  @Prop()
  name: string;
  @Prop()
  level: string;

  @Prop({ required: true })
  value: string[];
}

export const RantAcehSchema = SchemaFactory.createForClass(RantAceh);
