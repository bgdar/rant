import {  Module, NestModule } from '@nestjs/common';
import { RantController } from './rant.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RantKeywordIndo,
  RantKeywordIndoSchema,
} from 'src/schemas/rant-keyword-indo.schema';

import { RantKeywordIndoDbService } from './rant-keyword-indo.db.service';
import {
  RantDatasetIndo,
  RantDatasetIndoSchema,
} from 'src/schemas/rant-dataset-indo.schema';
import { RantDatasetIndoService } from './rant-dataset.indo.service';

import { RabbitMqDashboardClientProvider } from './rabbitMq.dashboard.client.provider';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMqUserClientProvider } from './rabbitMq.user.client.provider';
import { SosmedController } from './sosmed.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RantKeywordIndo.name, schema: RantKeywordIndoSchema },
      { name: RantDatasetIndo.name, schema: RantDatasetIndoSchema },
      // { name: RantAceh.name, schema: RantAceh } // gnakna aja nantik jika sudah meyakinkan dataset nya
    ]),

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
  ],
  providers: [
    RantKeywordIndoDbService,
    // RantAcehDbService
    RantDatasetIndoService,

    //------------------- Daftar Rabbit queue provider
    RabbitMqDashboardClientProvider,
    RabbitMqUserClientProvider,
  ],
  controllers: [RantController, SosmedController],

  // jika di panggil module ini maka provider atau lainya bisa di akses juga
  exports: [
    RantKeywordIndoDbService,
    // RantAcehDbService
    RantDatasetIndoService,

    // akan di gunakan di gateway 
    RabbitMqDashboardClientProvider,
    RabbitMqUserClientProvider,
  ],
})
export class RantModule {}
