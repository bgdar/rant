import {
  Body,
  Controller,
  Get,
  Header,
  HttpStatus,
  Post,
  Render,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';

import argon from 'argon2';

import { UserRepository } from '@/repository/user.repository';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserSessionDTO, UserSignUpDTO } from 'src/dto/user.dto';
import { AuthUserGuard } from 'src/guards/auth.user';
import { SupervisorSessionDTO } from 'src/dto/supervisor.dto';
import { SupervisorRepository } from '@/repository/supervisor.repository';
import { ConfigService } from '@nestjs/config';
import { httpDomain } from '@/constan';
import { GroupMessageForumisRepository } from '@/repository/group.message.forumis.repository';
// import { FastifySessionObject } from '@fastify/session';

@UseGuards(AuthUserGuard)
@Controller('/user')
export class UserController {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService,
    private readonly supervisorRepo: SupervisorRepository,
    private readonly groubForumisRepo: GroupMessageForumisRepository,
  ) {}

  @Get()
  @Render('user/home.ejs')
  async Home(@Req() req: FastifyRequest) {
    const user = (req as any).session?.user as UserSessionDTO;

    const latesGroupDiscution = await this.groubForumisRepo.getLatesChatUser(
      user.id,
    );

    return {
      title: 'home In',
      username: user.username,
      latestGroubMessage: latesGroupDiscution?.message || '',
    };
  }

  @Get('/profile')
  // izinkan menampilklan popup login telegram di halaman profile
  @Header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  @Render('/user/profile.ejs')
  async Profile(@Req() req: FastifyRequest) {
    const user = (req as any).session?.user as UserSessionDTO;
    // jika user sudah supervisor
    const supervisor = (req as any).session?.supervisor as SupervisorSessionDTO;

    const dataUser = await this.userRepo.findById(user.id);

    return {
      title: 'User Profile',
      user: {
        username: dataUser.username,
        role: dataUser.role,
        email: dataUser.email,
      },
      sosmed: {
        telegramId: dataUser.telegramId || '',
        discordId: dataUser.discordId || '',
        whatsappId: dataUser.whatsappId || '',
        telegram_client_id:
          this.configService.get<string>('TELEGRAM_OIDC_CLIENT_ID') || '',
        telegram_redirect: `${httpDomain}sosmed/telegram/callback`,
      },
      supervisor: supervisor || null,
    };
  }

  @Get('/update')
  @Render('/user/update-profile.ejs')
  async UpdateProfile(@Req() req: FastifyRequest) {
    const user = (req as any).session?.user as UserSessionDTO;

    return {
      title: `Update | ${user.username}`,
    };
  }

  /**
   * Render halaman login.
   */
  @Get('/signIn')
  @Render('user/signIn.ejs')
  signInView() {
    return {
      title: 'Sign In',
    };
  }

  /**
   * Login user menggunakan:
   * - Session
   * - Cookies
   */
  @Post('/signIn')
  async signInPost(
    @Body() data: UserSignUpDTO,

    @Session() session: Record<string, any>,
    @Req() req: FastifyRequest,

    @Res() res: FastifyReply,
  ) {
    const { email, password }: UserSignUpDTO = data;

    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      return res.status(HttpStatus.OK).send({
        message: 'User not found',
      });
    }

    const isMatch = await argon.verify(user.password, password);

    if (!isMatch) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        message: 'Wrong password',
      });
    }
    // dari secure-session
    // req.session.set('user', {
    //   id: user._id.toString(),
    //   username: user.username,
    //   email: user.email,
    //   role: user.role,
    // });

    // sudah di atur di session
    // res.setCookie('isUserLogin', user.username, {
    //   httpOnly: true,
    //   maxAge: 1000 * 60 * 60 * 24,
    //   secure: false,
    // });

    // ini id harus di ubah ke string , bisa juga ke hextring cuamn rentang crash
    // jika tidak nanitk ata session yang di simpan jika ada tulisan new Objeck ("...") , maka ikutan ke bawa jadi string
    session.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // nah di sini cek jika akun user ada di supervisor
    // dengan syarat di supervosor akun nya tidak di update , jika iya nantik ubha ke ID atau semacam forenkey
    const supervisor = await this.supervisorRepo.findByUsernameEmail(
      user.email,
      user.username,
    );

    // session untuk supervisor , langgsung login
    if (supervisor) {
      session.supervisor = {
        id: supervisor._id.toString(),
        username: user.username,
        email: user.email,
        phone: supervisor.phone,
        token: supervisor.token,
        role: supervisor.role,
        permission: supervisor.permissions,
      };
    }

    return res.status(HttpStatus.OK).send({
      message: 'Login success',
      session: session.user,
    });
  }

  /**
   * Render halaman register.
   */
  @Get('/signUp')
  @Render('user/signUp.ejs')
  signUpView() {
    return {
      title: 'Sign Up',
    };
  }

  /**
   * Register user baru.
   * Flow:
   */
  @Post('/signUp')
  async sigUpPost(
    @Body() data: UserSignUpDTO,

    @Session() session: Record<string, any>,

    @Res() res: FastifyReply,
  ) {
    const hashPassword = await argon.hash(data.password);

    const user = await this.userRepo.create({
      username: data.username,
      email: data.email,
      password: hashPassword,
    });

    // req.session.set('user', {
    //   id: user._id.toString(),
    //   username: user.username,
    //   email: user.email,
    //   role: user.role,
    // });

    // res.setCookie('isUserLogin', user.username, {
    //   httpOnly: true,
    //   maxAge: 1000 * 60 * 60 * 24,
    //   secure: false,
    // });

    // res.cookie('isUserLogin', true, {
    //   httpOnly: true,
    //   maxAge: 1000 * 60 * 60 * 24,
    // });
    session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // gak bisa redirect dari server jika kirim data response json
    return res.status(HttpStatus.OK).send({
      message: 'Register success',
      user,
    });
  }

  /**
   * Logout user.
   *
   */
  @Get('/logout')
  logout(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    // req.session.delete();
    // res.clearCookie('isUserLogin');

    req.session.destroy(() => {
      // res.clearCookie('isUserLogin');

      res.redirect('/');
    });

    // spesifik tapi gak memastikan kridential tertingga
    // Menghapus objek user dari session
    // delete req.session.user;

    // Atau menghapus supervisor juga jika ada
    // delete req.session.supervisor;
  }
}
