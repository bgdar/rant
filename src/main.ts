import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

import fastifyCookie from '@fastify/cookie';
// import fastifyFlash from '@fastify/flash'; // gak stabil di fastify
import session from '@fastify/session';
import fastifyView from '@fastify/view';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
// import expressLayout from 'express-ejs-layouts'; // untuk express , dengan ejs sudha ada fastify/view
import ejs from 'ejs';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Microservice RabbitMQ yang di guankan di projeck ini
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBIT_URL || 'amqp://localhost:5672'],
      // queue: 'queue-webDashb',
      // queueOptions: { durable: false },
    },
  });

  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });

  // ganti reqister karena menggunakan fastifyView
  // app.setViewEngine({
  //   engine: {
  //     ejs: {
  //       ejs,
  //     },
  //   },
  //   templates: join(__dirname, '..', 'views'),
  //   layout: 'components/layouts.ejs',
  //   // viewExt : "ejs" // gak saya pakai ,  tetap nulis extensi aja
  // });

  await app.register(fastifyView, {
    engine: { ejs },
    root: join(__dirname, '..', 'views'),
    // viewExt: 'ejs',
    templates: join(__dirname, '..', 'views'),
    layout: 'components/layouts.ejs',
  });

  await app.register(fastifyCookie, {
    secret: 'example-secret', // untuk sekarang aja
  });
  // await app.register(secureSession, {
  //   secret: 'averylogphrasebiggerthanthirtytwochars',
  //   salt: 'mq9hDxBVDbspDR6n',
  // });

  await app.register(session, {
    secret: 'your-secret-session-salt-12345ytsjdfn', // ni secret sementara aja wkwkw
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 hari
    },
  });

  await app.startAllMicroservices();

  console.info('APP running on : localhost:3000');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Gagal menjalankan aplikasi:', err);
  // Keluar dari proses jika fatal
  process.exit(1);
});
