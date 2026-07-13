import { isEnum, IsOptional } from 'class-validator';
import { UserRole } from './user.dto';

// export enum AkunUser {
//   USER = 'user',
//   SUPERVISOR = 'supervisor',
// }
//
// export class QueueUserDTO {
//   username: string;
//
//   @IsOptional()
//   discord_id: number | null;
//   @IsOptional()
//   telegram_id: number | null;
//   akun: AkunUser;
//   role: UserRole;
// }

export class QueueDashboardDTO {
  chatId: number;
  katagori: string;
  text: string;
  platform: string;


  // constructor karena akan di buat manual untk di kirim datanya
  constructor(chatId : number , katagori : string , text : string ) {
    this.chatId = chatId;
    this.katagori = katagori;
    this.text = text;
    this.platform = "queue-dashboard";
  }
}

export class QueueDashboardResponseDTO {
  chatId: number;
  katagori: string;
  response : string;
  platform: string;

  is_toxic : boolean;

  // constructor(chatId : number , katagori : string , text : string , platform : string) {
  //   this.chatId = chatId;
  //   this.katagori = katagori;
  //   this.text = text;
  //   this.platform = "queue-dashboard-response";
  // }
}

