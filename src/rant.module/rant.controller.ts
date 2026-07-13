import {
  Controller,
  Get,
  Post,
  Query,
  Render,
} from '@nestjs/common';
import { RabbitMqDashboardClientProvider } from './rabbitMq.dashboard.client.provider';

@Controller('rant')
export class RantController {
  // di sini hayer model nya nntik untuk di tampilkan di web app

   /*
  * *Bgdar : metode ini akan menambah layer , saya akan menganti nya dengan mengimport conection ke rabbitMq ke gateway langsung untuk prediksi 
  */ 
  // constructor(private RbDashboardClient: RabbitMqDashboardClientProvider) {}

  @Get()
  @Render('rant/home.ejs')
  home() {
    return {
      title: 'home',
    };
  }

  // ----------- API for Server Api -----------

  /**
   * ini adalah prediksi untuk mengirm data ke server di mana model di jalakna untuk prediksi
   * nantik forums view cukup panggil ke rant
   * yap predict untuk web dashboard
   */
   /*
  * *Bgdar : metode ini akan menambah layer , saya akan menganti nya dengan mengimport conection ke rabbitMq ke gateway langsung untuk prediksi 
  */ 

  // @Post('/predict')
  // async predictPost(@Query('text') text: string) {
  //   console.info('tex : ', text);
  //   // anntik validasi aja aceh apakah idno  , methodnya tetap saa
  //   if (text.length != 0) {
  //     const prediction: string =
  //       await this.RbDashboardClient.sendForPredict(text);
  //     console.info('hasil prediction : ', prediction);
  //   }
  // }


  // --- EXPORT MODEL Api data agar bisa di gunakan di   aplikasi lain---------- 
}
