import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { WeatherService } from './weather.service';

describe('SummaryController', () => {
  let controller: SummaryController;
  let summaryService: SummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummaryController],
      providers: [SummaryService, WeatherService, ConfigService],
    }).compile();

    controller = module.get<SummaryController>(SummaryController);
    summaryService = module.get<SummaryService>(SummaryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(summaryService).toBeDefined();
  });

  describe('getSummary', () => {
    it('should call summaryService.getSummary', async () => {
      // given
      const getSummaryFn = jest.spyOn(summaryService, 'getSummary').mockResolvedValueOnce({} as any);

      // when
      await controller.getSummary(-1, 100);

      // then
      expect(getSummaryFn).toBeCalledTimes(1);
    });
  });
});
