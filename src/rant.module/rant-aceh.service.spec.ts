import { Test, TestingModule } from '@nestjs/testing';
import { RantAcehService } from './rant-aceh.service';

describe('RantAcehService', () => {
  let service: RantAcehService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RantAcehService],
    }).compile();

    service = module.get<RantAcehService>(RantAcehService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
