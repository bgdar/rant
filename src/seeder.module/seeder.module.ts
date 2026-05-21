import { Module } from '@nestjs/common';
import { DataKeywordDummyService } from './data-keyword-dummy.service';
import { RantModule } from 'src/rant.module/rant.module';
import { DatasetIndoDummyService } from './dataset-indo-dummy.service';

@Module({
  // RantModule : agar seederModule bisa  mengakses ke RantModel yang ada di module ini
  imports: [RantModule],
  providers: [DataKeywordDummyService, DatasetIndoDummyService],
})
export class SeederModule {}
