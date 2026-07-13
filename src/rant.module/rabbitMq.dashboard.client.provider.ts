import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { QueueDashboardDTO, QueueDashboardResponseDTO } from 'src/dto/rant.dto';

@Injectable()
export class RabbitMqDashboardClientProvider {
  private readonly qeueuDashboard: string = 'dashboardPredict';

  constructor(
    @Inject('DAHBOARD_CLIENT') private readonly client: ClientProxy,
  ) {}

  async isAlive(): Promise<boolean> {
    try {
      // Mencoba melakukan koneksi ke broker RabbitMQ
      await this.client.connect();
      return true; // Jika berhasil, RabbitMQ hidup
    } catch (error) {
      // Jika gagal terhubung atau broker mati, tangkap error-nya
      console.error('RabbitMQ tidak merespons / mati:', error.message);
      return false; // RabbitMQ mati
    }
  }

  async sendForPredict(
    data: QueueDashboardDTO,
  ): Promise<QueueDashboardResponseDTO> {
    // const rabbitMqStatus = await this.isAlive();
    //
    // if (!rabbitMqStatus) {
    //   throw new InternalServerErrorException(
    //     'Gagal memproses data: Layanan RabbitMQ saat ini sedang mati / tidak dapat dihubungi.',
    //   );
    // }

    try {
      // lebih baik dari pada send( ) dari pada emit(khusu kirim aja) untuk mengirim pesan ke RabbitMq
      const predictResponse = await lastValueFrom<QueueDashboardResponseDTO>(
        this.client.send(this.qeueuDashboard, data),
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
