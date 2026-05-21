import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RantController } from './rant.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RantKeywordIndo,
  RantKeywordIndoSchema,
} from 'src/schemas/rant-keyword-indo.schema';
import {
  RantKeywordAceh,
  RantKeywordAcehSchema,
} from 'src/schemas/rant-keyword-aceh.schema';
import { RantKeywordIndoDbService } from './rant-keyword-indo.db.service';
import { RantAcehDbService } from './rant-keyword-aceh.db.service';
import {
  RantDatasetIndo,
  RantDatasetIndoSchema,
} from 'src/schemas/rant-dataset-indo.schema';
import { RantDatasetIndoService } from './rant-dataset.indo.service';
import { BotComunication } from './bot.comunication';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RantKeywordIndo.name, schema: RantKeywordIndoSchema },
      { name: RantDatasetIndo.name, schema: RantDatasetIndoSchema },
      // { name: RantAceh.name, schema: RantAceh } // gnakna aja nantik jika sudah meyakinkan dataset nya
    ]),
  ],
  providers: [
    RantKeywordIndoDbService,
    // RantAcehDbService
    RantDatasetIndoService,
    // BotComunication,
  ],
  controllers: [RantController],

  // jika di panggil module ini maka provider atau lainya bisa di akses juga
  exports: [
    RantKeywordIndoDbService,
    // RantAcehDbService
    RantDatasetIndoService,
  ],
})
export class RantModule {}
