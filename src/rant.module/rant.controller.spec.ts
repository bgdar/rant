import { Test, TestingModule } from '@nestjs/testing';
import { RantController } from './rant.controller';

describe('RantController', () => {
  let controller: RantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RantController],
    }).compile();

    controller = module.get<RantController>(RantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
