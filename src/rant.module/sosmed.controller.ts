import { Controller, Get } from '@nestjs/common';

const discord: string = 'discord';
const telegram: string = 'telegram';

@Controller('sosmed')
export class SosmedController {
  @Get(discord + '/login')
  discordLogin() {
    return {
      title: `${discord} | Login`,
    };
  }

  @Get(telegram + '/login')
  telegramLogin() {
    return {
      title: `${telegram} | Login`,
    };
  }
}
