import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Render,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';

import argon from 'argon2';
import { UserDbService } from './user.db.service';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserSessionDTO, UserSignUpDTO } from 'src/dto/user.dto';
import { AuthUserGuard } from 'src/guards/auth.user';
import { SupervisorDbService } from 'src/supervisor.module/supervisor.db.service';
import { SupervisorSessionDTO } from 'src/dto/supervisor.dto';
// import { FastifySessionObject } from '@fastify/session';

@UseGuards(AuthUserGuard)
@Controller('/user')
export class UserController {
  constructor(
    private readonly userModel: UserDbService,
    private readonly supervisorModel: SupervisorDbService,
  ) {}

  @Get()
  @Render('user/home.ejs')
  Home(@Req() req: FastifyRequest) {
    const user = (req as any).session?.user as UserSessionDTO;

    return {
      title: 'home In',
      username: user.username,
    };
  }

  @Get('/profile')
  @Render('/user/profile.ejs')
  async Profile(@Req() req: FastifyRequest) {
    const user = (req as any).session?.user as UserSessionDTO;

    // jika user sudah supervisor
    const supervisor = (req as any).session?.supervisor as SupervisorSessionDTO;

    const dataUser = await this.userModel.findById(user.id);


    console.info("Data user profile : ",dataUser)

    return {
      title: 'User Profile',
      user: {
        username: dataUser.username,
        role: dataUser.role,
        email: dataUser.email,
      },
      supervisor: supervisor || null ,
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

    const user = await this.userModel.findByEmail(email);

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
    session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // nah di sini cek jika akun user ada di supervisor
    // dengan syarat di supervosor akun nya tidak di update , jika iya nantik ubha ke ID atau semacam forenkey
    const supervisor = await this.supervisorModel.findByUsernameEmail(
      user.email,
      user.username,
    );

    console.info("data supervisor di login : ",supervisor)

    // session untuk supervisor , langgsung login
    if (supervisor) {
      session.supervisor = {
        id: supervisor._id,
        username: user.username,
        email: user.email,
        phone: supervisor.phone,
        token: supervisor.token,
        permission: supervisor.permissions,
      };

      console.info(user.username, 'punya akses ke supervisor');
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

    const user = await this.userModel.create({
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
