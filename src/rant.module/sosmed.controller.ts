import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  Session,
} from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigService } from '@nestjs/config';
import { UserDbService } from 'src/user.module/user.db.service';
import { UserSessionDTO } from 'src/dto/user.dto';

import { domain, httpDomain } from '@/constan';
import { DiscordUserDto, TelegramUserDto } from '@/dto/rant.dto';

const discord: string = 'discord';
const telegram: string = 'telegram';

@Controller('sosmed')
export class SosmedController {
  constructor(
    private readonly config: ConfigService,
    private readonly userDbService: UserDbService,
  ) {}

  @Get(discord)
  discordHome() {
    return {
      title: 'Welcome Discord',
    };
  }

  // Menerima Callback dari Discord
  @Get(discord + '/callback')
  async discordLogin(
    @Res() res: FastifyReply,
    @Req() req: FastifyRequest,
    @Query('code') code: string,
    @Session() session: Record<string, any>,
  ) {
    if (!code)
      return res.status(HttpStatus.BAD_GATEWAY).send({
        message: 'Failed Outh2 Discord',
      });

    try {
      //Tukar code dengan Access Token menggunakan native fetch (POST)
      const client_id = this.config.get<string>('DISCORD_CLIENT_ID');
      const client_secret = this.config.get<string>('DISCORD_CLIENT_SECRET');
      const redirect_uri = this.config.get<string>('DISCORD_REDIRECT_URL');

      if (client_id && client_secret && redirect_uri) {
        const tokenResponse = await fetch(
          'https://discord.com/api/oauth2/token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: client_id,
              client_secret: client_secret,
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: redirect_uri,
            }).toString(),
          },
        );

        if (!tokenResponse.ok) {
          // Ambil respons asli dari Discord
          const errorData = await tokenResponse.json();
          console.error(errorData);
          // Lemparkan error dengan pesan dari Discord
          throw new Error(
            `Gagal Discord: ${errorData.error_description || errorData.error}`,
          );
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        //  Ambil data profil User dari Discord menggunakan native fetch (GET)
        const userResponse = await fetch(
          'https://discord.com/api/v10/users/@me',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!userResponse.ok) {
          throw new Error('Gagal mengambil profil user dari Discord');
        }

        const userData = (await userResponse.json()) as DiscordUserDto;
        const { id, username } = userData;
        console.info('discord user : ', id, username);
        // user session
        const currentUser = (req as any).session?.user as UserSessionDTO;

        const existingTelegramUser =
          await this.userDbService.findByDiscordId(id);
        if (
          existingTelegramUser &&
          existingTelegramUser.id !== currentUser.id
        ) {
          // Telegram ID sudah terhubung ke akun orang lain!
          return res.redirect(
            '/user/profile?error=telegram_already_used_by_other_account',
          );
        }

        // save id
        await this.userDbService.addDiscordId(currentUser.id, id);

        //update session  ke id yg baru
        session.user = {
          ...currentUser,
          discordId: id,
        };

        return res.redirect(`${domain}/sosmed/discord`);
      } else {
        console.error('tidak dapat env config dari discord');
        return res.status(HttpStatus.BAD_GATEWAY).send({
          message: 'Failed Outh2 Discord',
        });
      }
    } catch (error: any) {
      // throw new HttpException(
      //   error.message || 'Gagal melakukan autentikasi Discord',
      //   HttpStatus.INTERNAL_SERVER_ERROR,
      // );
      console.error('Error mendapat data user discord : ', error.message);
      res.redirect(`${domain}/gagal-login`);
    }

    return {
      title: `${discord} | Login`,
    };
  }

  @Get(discord + '/gagal-login')
  discordGagalLogin() {
    return {
      title: 'gagal loogin',
    };
  }

  @Get(telegram)
  telegramdHome() {
    return {
      title: 'Welcome Discord',
    };
  }
  /*
   * ini untuk login  telegram mengguakan OpenID Connect mirip metode discord
   */
  @Get(telegram + '/callback')
  async telegramCallbackOpenId(
    @Query('code') code: string,
    @Res() res: FastifyReply,
    @Req() req: FastifyRequest,
    @Session() session: Record<string, any>,
  ) {
    try {
      if (!code) {
        return res
          .status(400)
          .send({ message: 'Authorization code tidak ditemukan.' });
      }

      const clientId = this.config.get<string>('TELEGRAM_OIDC_CLIENT_ID') || '';
      const clientSecret =
        this.config.get<string>('TELEGRAM_OIDC_CLIENT_SECRET') || '';
      const redirectUri = `${httpDomain}sosmed/telegram/callback`;
      // Tukar 'code' dengan 'id_token' ke Server Telegram
      const tokenResponse = await fetch('https://oauth.telegram.org/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code, // Tukar 'code' dengan 'id_token' ke Server Telegram
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.id_token) {
        throw new Error(
          tokenData.error_description || 'Gagal mendapatkan id_token',
        );
      }

      // Decode id_token JWT (Payload berisi data user lengkap)
      const base64Payload = tokenData.id_token.split('.')[1];
      const payloadString = Buffer.from(base64Payload, 'base64').toString(
        'utf-8',
      );
      const userClaims = JSON.parse(payloadString) as TelegramUserDto;

      console.log('>>> [OIDC BACKEND] Claims User dari ID Token:', userClaims);
      // Isi userClaims: { sub, id, name, preferred_username, phone_number, dll }

      const telegramId = userClaims.id ? String(userClaims.id) : null;

      if (!telegramId) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          message: 'Data ID Telegram tidak valid dari penyedia OIDC.',
        });
      }

      const currentUser = (req as any).session?.user as UserSessionDTO;

      //  Ambil data user saat ini dari DB
      const dbUser = await this.userDbService.findById(currentUser.id);
      if (!dbUser) {
        return res.redirect('/auth/login?error=user_not_found');
      }

      // KEAMANAN: Cek apakah ID Telegram ini sudah dipakai oleh AKUN LAIN di sistem
      const existingTelegramUser =
        await this.userDbService.findByTelegramId(telegramId);
      if (existingTelegramUser && existingTelegramUser.id !== currentUser.id) {
        // Telegram ID sudah terhubung ke akun orang lain!
        return res.redirect(
          '/user/profile?error=telegram_already_used_by_other_account',
        );
      }

      //  Cek apakah AKUN SAAT INI sudah memiliki Telegram ID
      if (!dbUser.telegramId) {
        // Simpan ke Database
        await this.userDbService.addtelegramId(currentUser.id, telegramId);

        //update session  ke id yg baru
        session.user = {
          ...currentUser,
          telegramId: telegramId,
        };

        // Tampilkan Halaman EJS Sukses
        return res
          .status(HttpStatus.OK)
          .view('rant/telegram/success-login-openid.ejs', {
            userClaims: userClaims,
            targetUrl: '/user/profile',
          });
      } else {
        // Jika akun ini sudah pernah menghubungkan Telegram, redirect rapi kembali ke profil
        return res.redirect('/user/profile?info=already_linked'); // ubah nantik aja
      }
    } catch (error: any) {
      console.error('>>> [OIDC BACKEND ERROR]:', error.message);
      return res.redirect('/user/profile?status=error');
    }
  }

  /*
   * nantik login bisa dnegan popup juga atau openId dari yg di atas
   * yg penting url web https sudah di daftarkan di @botFater
   * masih belum pasti wkwkwkw
   */
  @Post(telegram + '/callback')
  async telegramCallbackPopup(
    @Res() res: FastifyReply,
    @Req() req: FastifyRequest,
    @Body('id_token') idToken: string, //  Tangkap id_token dari Body
    @Session() session: Record<string, any>,
  ) {
    const currentUser = (req as any).session?.user as UserSessionDTO;

    try {
      if (!idToken) {
        return res.status(400).send({
          success: false,
          message: 'id_token tidak ditemukan pada request body.',
        });
      }

      // Dekode Payload JWT (id_token)
      const base64Payload = idToken.split('.')[1];
      const payloadString = Buffer.from(base64Payload, 'base64').toString(
        'utf-8',
      );
      const userData = JSON.parse(payloadString) as TelegramUserDto;

      console.log('>>> Payload User Telegram:', userData);

      //  Ambil ID Telegram dari id_token ( ini adlah JWT )
      // Catatan: userData.id ("6953398906") adalah ID unik user Telegram.
      // userData.sub ("3922283955273650004") adalah Subject OIDC.
      const telegramId = userData.id || userData.sub;

      if (!telegramId) {
        throw new Error('Telegram ID tidak ditemukan di dalam payload token.');
      }
      // cek keamana
      const existingTelegramUser =
        await this.userDbService.findByTelegramId(telegramId);
      if (existingTelegramUser && existingTelegramUser.id !== currentUser.id) {
        // Telegram ID sudah terhubung ke akun orang lain!
        return res.redirect(
          '/user/profile?error=telegram_already_used_by_other_account',
        );
      }

      // Simpan ke Database
      await this.userDbService.addtelegramId(
        currentUser.id,
        String(telegramId),
      );

      //update session  ke id yg baru
      session.user = {
        ...currentUser,
        telegramId: telegramId,
      };

      console.log(
        `>>> Berhasil update Telegram ID (${telegramId}) untuk User (${currentUser.id})`,
      );

      // irim Respon JSON ke Frontend (AlpineJS)
      return res.status(200).send({
        success: true,
        message: 'Akun Telegram berhasil terhubung.',
        user: {
          telegramId,
          name: userData.name,
        },
      });
    } catch (error: any) {
      console.error('>>> Telegram Auth Error:', error.message);
      return res.status(500).send({
        success: false,
        message: error.message || 'Gagal memproses otentikasi Telegram.',
      });
    }
  }

  @Get(telegram + '/gagal-login')
  telegramGagalLogin() {
    return {
      title: 'gagal loogin',
    };
  }
}
