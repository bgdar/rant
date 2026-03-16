import { Test, TestingModule } from '@nestjs/testing';
import { DataDummyService } from './data-dummy.service';

describe('DataDummyService', () => {
  let service: DataDummyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataDummyService],
    }).compile();

    service = module.get<DataDummyService>(DataDummyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
