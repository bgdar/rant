import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // default "/"
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('dashboard.ejs')
  dashboard() {
    return {
      title: ' dashboard',
    };
  }

  @Get('/article')
  @Render('article.ejs')
  article() {
    return {
      title: 'article',
    };
  }

  // karena gak ada konsep admin , maka login user di sini aja
  @Get('/user/signIn')
  @Render('user/signIn.ejs')
  signInView() {
    return {
      title: 'Sign In',
    };
  }
  @Get('/user/signUp')
  @Render('user/signUp.ejs')
  signUpView() {
    return {
      title: 'Sign In',
    };
  }
}
