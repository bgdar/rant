import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientGrpcProxy } from '@nestjs/microservices';
import { UserDTO } from 'src/dto/user.dto';

@Injectable()
export class RabbitMqUserClientProvider {
  constructor(@Inject('USER_CLIENT') private client: ClientGrpcProxy) {}

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

  /*
   * kirim data user
   * Note : 2.
   * -
   */
  async sendUserData(user: UserDTO, isSupervosir = false): Promise<void> {
    const rabbitMqStatus = await this.isAlive();

    if (!rabbitMqStatus) {
      throw new InternalServerErrorException(
        'Gagal memproses data: Layanan RabbitMQ saat ini sedang mati / tidak dapat dihubungi.',
      );
    }
    try {
      this.client.send('user', {
        username: user.username,
        role: user.role,
        akun: isSupervosir ? 'user' : 'supervisor',

        // id plafrom jika sudah login antara sosmed akun
        discord_id: user.discordId,
        telegram_id: user.telegramId,
      });
    } catch (err) {
      console.error('erro di send user ke RabbitMqUserClientProvid : ', err);

      throw new InternalServerErrorException(
        'Gagal mengirim data ke queue user : ' + err,
      );
    }
  }
}
