import { Global, Module } from '@nestjs/common';
import { RabbitMqModule } from '@/rabbitmq/rabbitmq.module';
import { RepositoryModule } from '@/repository/repository.module';
import { AppGateway } from './app.gateway';

// gateway bisa global karena cuman 1 saja dan banyak di guakan di module lain
// dan tidak perlu import import lagi antar module terpisah
// !! cukup di sini aja lk, karena decorator @Global sulit di lacak
@Global()
@Module({
  // rabbitmq pasti di guakan di module gateway untuk komunikasi ke RabbitMq nya
  imports: [
    RabbitMqModule, // ada untuk mengririm dan menerima data dari rabbitMq
    RepositoryModule, // ada komunikasi databas di app gateway
  ],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
