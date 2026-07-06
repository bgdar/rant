import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { RantDatasetDTO } from 'src/dto/data.dto';
export type CatDocument = HydratedDocument<RantDatasetIndo>;

@Schema()
export class RantDatasetIndo implements RantDatasetDTO {
  @Prop()
  text: string;
  @Prop()
  toxic: number;
  @Prop()
  severe_toxic: number;
  @Prop()
  obscene: number;

  @Prop()
  threat: number;

  @Prop()
  insult: number;

  @Prop()
  identity_hate: number;
}

export const RantDatasetIndoSchema =
  SchemaFactory.createForClass(RantDatasetIndo);
