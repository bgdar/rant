import { Module } from '@nestjs/common';
import { RantController } from './rant.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RantIndo, RantIndoSchema } from 'src/schemas/rant-indo.schema';
import { RantAceh, RantAcehSchema } from 'src/schemas/rant-aceh.schema';
import { RantIndoService } from './rant-indo.service';
import { RantAcehService } from './rant-aceh.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RantIndo.name, schema: RantIndoSchema },
      // { name: RantAceh.name, schema: RantAceh } // gnakna aja nantik jika sudah meyakinkan dataset nya
    ]),
  ],
  providers: [
    RantIndoService,
    // RantAcehService
  ],
  controllers: [RantController],

  // jika di panggil module ini maka provider atau lainya bisa di akses juga
  exports: [
    RantIndoService,
    // RantAcehService
  ],
})
export class RantModule {}
