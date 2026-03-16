import { Module } from '@nestjs/common';
import { DataDummyService } from './data-dummy.service';
import { RantModule } from 'src/rant.module/rant.module';

@Module({
  // RantModule : agar seederModule bisa  mengakses ke RantModel yang ada di module ini
  imports: [RantModule],
  providers: [DataDummyService],
})
export class SeederModule { }
