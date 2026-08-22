import { Module } from '@nestjs/common';
import { DashboardClientRabbitMq } from './dashboard.client.rabbitmq';
import { UserClientRabbitMq } from './user.client.rabbitmq';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DAHBOARD_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: process.env.RABBITDWEB || 'queue-dashboard', // queue mengiri reques
          replyQueue:
            process.env.RABBITDWEBRESPONSE || 'queue-dashboard-response', // hasil response dengan queue berbea
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        // queu untuk kirim data user login dan sejenis nya ke queue untuk bot nantik mengaksesnya
        name: 'USER_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: process.env.RABBITUSER || 'queue-user', // queue mengiri reques
        },
      },
    ]),
    ConfigModule,
  ],
  exports: [DashboardClientRabbitMq, UserClientRabbitMq],

  providers: [DashboardClientRabbitMq, UserClientRabbitMq],
})
export class RabbitMqModule {}
