import {
  isEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
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
  constructor(chatId: number, katagori: string, text: string) {
    this.chatId = chatId;
    this.katagori = katagori;
    this.text = text;
    this.platform = 'queue-dashboard';
  }
}

export class QueueDashboardResponseDTO {
  chatId: number;
  katagori: string;
  response: string;
  platform: string;

  is_toxic: boolean;

  // constructor(chatId : number , katagori : string , text : string , platform : string) {
  //   this.chatId = chatId;
  //   this.katagori = katagori;
  //   this.text = text;
  //   this.platform = "queue-dashboard-response";
  // }
}

// -----------  SOSMED -----------------------
export class DiscordUserDto {
  /** ID unik pengguna (Snowflake) */
  id: string;

  /** Username Discord pengguna */
  username: string;

  /** Discriminator Discord pengguna (format lama #0000, sekarang biasanya "0") */
  discriminator: string;

  /** Nama tampilan global pengguna (Display Name) */
  global_name: string | null;

  /** Hash avatar pengguna (null jika tidak punya avatar) */
  avatar: string | null;

  /** Hash banner profil pengguna (opsional) */
  banner?: string | null;

  /** Kode warna aksen profil (opsional) */
  accent_color?: number | null;

  /** Apakah pengguna ini adalah bot (opsional) */
  bot?: boolean;

  /** Apakah pengguna ini adalah sistem Discord resmi (opsional) */
  system?: boolean;

  /** Apakah pengguna mengaktifkan Autentikasi Dua Faktor (MFA) (opsional) */
  mfa_enabled?: boolean;

  /** Bahasa/lokasi pengguna (opsional) */
  locale?: string;

  /** Apakah email pengguna sudah diverifikasi (opsional, butuh scope 'email') */
  verified?: boolean;

  /** Email pengguna (opsional, butuh scope 'email') */
  email?: string | null;

  /** Flags akun pengguna (opsional) */
  flags?: number;

  /** Tipe premium (Nitro) pengguna (opsional) */
  premium_type?: number;

  /** Public flags pengguna (opsional) */
  public_flags?: number;
}

export class TelegramUserDto {
  @IsString()
  @IsNotEmpty()
  sub: string;

  @IsString()
  @IsNotEmpty()
  aud: string;

  @IsNumber()
  @IsNotEmpty()
  exp: number;

  @IsNumber()
  @IsNotEmpty()
  iat: number;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  iss: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  given_name: string;

  @IsString()
  @IsOptional()
  family_name?: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  // Field opsional tambahan standar OIDC Telegram (jika diizinkan user)
  @IsString()
  @IsOptional()
  preferred_username?: string;

  @IsString()
  @IsOptional()
  picture?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;
}
