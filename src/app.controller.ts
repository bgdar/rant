import { Body, Controller, Get, Render } from '@nestjs/common';

@Controller() // default "/"
export class AppController {
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
}
