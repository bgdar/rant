import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { RantKeywordDTO } from 'src/dto/data.dto';

@Schema()
export class RantKeywordAceh implements RantKeywordDTO {
  @Prop()
  name: string;
  @Prop()
  level: string;

  @Prop({ required: true })
  value: string[];
}

export const RantKeywordAcehSchema =
  SchemaFactory.createForClass(RantKeywordAceh);
