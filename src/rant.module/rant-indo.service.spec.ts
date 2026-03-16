import { Test, TestingModule } from '@nestjs/testing';
import { RantIndoService } from './rant-indo.service';

describe('RantIndoService', () => {
  let service: RantIndoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RantIndoService],
    }).compile();

    service = module.get<RantIndoService>(RantIndoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
