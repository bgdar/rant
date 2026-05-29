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
// import { FastifySessionObject } from '@fastify/session';

@UseGuards(AuthUserGuard)
@Controller('/user')
export class UserController {
  constructor(private readonly userModel: UserDbService) {}

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

    const dataUser = await this.userModel.findById(user.id);

    return {
      title: 'User Profile',
      user: {
        username: dataUser.username,
        role: dataUser.role,
        email: dataUser.email,
      },
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
  }
}
