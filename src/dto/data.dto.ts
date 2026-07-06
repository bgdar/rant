import { IsArray, IsString } from 'class-validator';

// mau rant indo , aceh atau apapu , formatnya sama
export class RantKeywordDTO {
  @IsString()
  name: string;
  @IsString()
  level: string;
  @IsArray()
  value: string[];
}

export class RantDatasetDTO {
  text: string;
  toxic: number;
  severe_toxic: number;
  obscene: number;
  threat: number;
  insult: number;
  identity_hate: number;
}
