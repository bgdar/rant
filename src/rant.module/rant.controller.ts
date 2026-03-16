import { Controller, Get, Render } from '@nestjs/common';
import { title } from 'process';

@Controller('rant')
export class RantController {
  // di sini hayer model nya nntik untuk di tampilkan di web app

  @Get()
  @Render('rant/home.ejs')
  home() {
    return {
      title: 'home',
    };
  }
}
