import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RabbitMqDashboardClientProvider {
  constructor(
    @Inject('DASHBOARD_CLIENT') private readonly client: ClientProxy,
  ) {}

  async sendForPredict(text: string): Promise<string> {
    try {
      // lebih baik dari pada send( ) dari pada emit(khusu kirim aja) untuk mengirim pesan ke RabbitMq
      const predictResponse = await lastValueFrom<string>(
        this.client.send('dashboardPredict', text),
      );
      return predictResponse;
    } catch (err) {
      console.error('error : ', err);
      // Menangani error jika RabbitMQ down atau timeout
      throw new InternalServerErrorException(
        `Gagal mendapatkan prediksi dari queue: ${err}`,
      );
    }
  }
}
