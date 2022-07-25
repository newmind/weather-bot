import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { SummaryService } from './summary.service';
import { WeatherService } from './weather.service';

import { CurrentResDto, ForecastResDto, HistoryResDto, WeatherCode } from '@src/summary/dto/weather.dto';

describe('SummaryService', () => {
  let service: SummaryService;
  let weatherService: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SummaryService, WeatherService, ConfigService],
    }).compile();

    service = module.get<SummaryService>(SummaryService);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(weatherService).toBeDefined();
  });

  describe('getSummary', () => {
    it("[success] should call weatherService's method", async () => {
      // given
      const getCurrentFn = jest
        .spyOn(weatherService, 'getCurrent')
        .mockResolvedValue({ timestamp: 1, temp: 15, code: 1, rain1h: 10 });
      const getHistoryFn = jest
        .spyOn(weatherService, 'getHistory')
        .mockResolvedValue({ timestamp: 1, temp: 15, code: 1, rain1h: 10 });
      const getForecastFn = jest
        .spyOn(weatherService, 'getForecast')
        .mockResolvedValue({ timestamp: 1, min_temp: 15, max_temp: 30, code: 1, rain: 10 });

      // when
      const result = await service.getSummary(-1, 1);

      // then
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.greeting).toBeDefined();
      expect(typeof result.summary.greeting).toBe('string');
      expect(result.summary.temperature).toBeDefined();
      expect(typeof result.summary.temperature).toBe('string');
      expect(result.summary['heads-up']).toBeDefined();
      expect(typeof result.summary['heads-up']).toBe('string');

      expect(getCurrentFn).toBeCalledTimes(1);
      expect(getHistoryFn).toBeCalledTimes(4);
      expect(getForecastFn).toBeCalledTimes(8);
    });

    it('[failed] should fail if one of weatherServices failed', async () => {
      // given
      const getCurrentFn = jest
        .spyOn(weatherService, 'getCurrent')
        .mockResolvedValue({ timestamp: 1, temp: 15, code: 1, rain1h: 10 });
      const getHistoryFn = jest
        .spyOn(weatherService, 'getHistory')
        .mockResolvedValue({ timestamp: 1, temp: 15, code: 1, rain1h: 10 })
        .mockRejectedValueOnce(new Error('timeout')); // failed case
      const getForecastFn = jest
        .spyOn(weatherService, 'getForecast')
        .mockResolvedValue({ timestamp: 1, min_temp: 15, max_temp: 30, code: 1, rain: 10 });

      // when
      try {
        await service.getSummary(-1, 1);
        expect(true).toBe(false);
      } catch (error) {
        // then
        expect(error).toBeInstanceOf(Error);
        expect(getCurrentFn).toBeCalledTimes(1);
        expect(getHistoryFn).toBeCalledTimes(4);
        expect(getForecastFn).toBeCalledTimes(8);
      }
    });
  });

  describe('static getGreeting', () => {
    it('[success] 0. 폭설', async () => {
      // given
      const current: CurrentResDto = {
        code: WeatherCode.SNOW,
        rain1h: 100,
        temp: 15,
        timestamp: 0,
      };

      // when
      const greeting = SummaryService.getGreeting(current);

      // then
      expect(greeting).toBeDefined();
      expect(greeting).toBe(SummaryService.greetings[0]);
    });

    it('[success] 1. 눈', async () => {
      // given
      const current: CurrentResDto = {
        code: WeatherCode.SNOW,
        rain1h: 99,
        temp: 15,
        timestamp: 0,
      };

      // when
      const greeting = SummaryService.getGreeting(current);

      // then
      expect(greeting).toBeDefined();
      expect(greeting).toBe(SummaryService.greetings[1]);
    });

    it('[success] 2. 폭우', async () => {
      // given
      const current: CurrentResDto = {
        code: WeatherCode.RAIN,
        rain1h: 100,
        temp: 14,
        timestamp: 0,
      };

      // when
      const greeting = SummaryService.getGreeting(current);

      // then
      expect(greeting).toBeDefined();
      expect(greeting).toBe(SummaryService.greetings[2]);
    });

    it('[success] 3. 비', async () => {
      // given
      const current: CurrentResDto = {
        code: WeatherCode.RAIN,
        rain1h: 99,
        temp: 14,
        timestamp: 0,
      };

      // when
      const greeting = SummaryService.getGreeting(current);

      // then
      expect(greeting).toBeDefined();
      expect(greeting).toBe(SummaryService.greetings[3]);
    });

    it('[success] 4. 흐림', async () => {
      // given
      const current: CurrentResDto = {
        code: WeatherCode.CLOUD,
        rain1h: 99,
        temp: 14,
        timestamp: 0,
      };

      // when
      const greeting = SummaryService.getGreeting(current);

      // then
      expect(greeting).toBeDefined();
      expect(greeting).toBe(SummaryService.greetings[4]);
    });

    it('[success] 5. 맑음, 30도 이상', async () => {
      // given
      const current: CurrentResDto = {
        code: WeatherCode.CLEAN,
        rain1h: 99,
        temp: 30,
        timestamp: 0,
      };

      // when
      const greeting = SummaryService.getGreeting(current);

      // then
      expect(greeting).toBeDefined();
      expect(greeting).toBe(SummaryService.greetings[5]);
    });

    it('[success] 6. 0도 이하', async () => {
      // given
      const current: CurrentResDto = {
        code: WeatherCode.CLEAN,
        rain1h: 99,
        temp: 0,
        timestamp: 0,
      };

      // when
      const greeting = SummaryService.getGreeting(current);

      // then
      expect(greeting).toBeDefined();
      expect(greeting).toBe(SummaryService.greetings[6]);
    });

    it('[success] 7. 그 외', async () => {
      // given
      const current: CurrentResDto = {
        code: WeatherCode.CLEAN,
        rain1h: 99,
        temp: 1,
        timestamp: 0,
      };

      // when
      const greeting = SummaryService.getGreeting(current);

      // then
      expect(greeting).toBeDefined();
      expect(greeting).toBe(SummaryService.greetings[7]);
    });
  });

  describe('static getTempString', () => {
    it('[success] 1. 덜 더움', async () => {
      // given
      const current: CurrentResDto = {
        temp: 15,
        code: undefined,
        rain1h: 0,
        timestamp: 0,
      };
      const yesterday: HistoryResDto = {
        temp: 20,
        code: undefined,
        rain1h: 0,
        timestamp: 0,
      };

      // when
      const tempString = SummaryService.getTempString(current, yesterday);

      // then
      const n = yesterday.temp - current.temp;
      expect(tempString).toBe(`어제보다 ${n}도 덜 덥습니다. `);
    });

    it('[success] 2. 더 추움', async () => {
      // given
      const current: CurrentResDto = {
        temp: 14,
        code: undefined,
        rain1h: 0,
        timestamp: 0,
      };
      const yesterday: HistoryResDto = {
        temp: 20,
        code: undefined,
        rain1h: 0,
        timestamp: 0,
      };

      // when
      const tempString = SummaryService.getTempString(current, yesterday);

      // then
      const n = yesterday.temp - current.temp;
      expect(tempString).toBe(`어제보다 ${n}도 더 춥습니다. `);
    });

    it('[success] 3. 더 더움', async () => {
      // given
      const current: CurrentResDto = {
        temp: 15,
        code: undefined,
        rain1h: 0,
        timestamp: 0,
      };
      const yesterday: HistoryResDto = {
        temp: 13,
        code: undefined,
        rain1h: 0,
        timestamp: 0,
      };

      // when
      const tempString = SummaryService.getTempString(current, yesterday);

      // then
      const n = current.temp - yesterday.temp;
      expect(tempString).toBe(`어제보다 ${n}도 더 덥습니다. `);
    });

    it('[success] 4. 덜 추움', async () => {
      // given
      const current: CurrentResDto = {
        temp: 14,
        code: undefined,
        rain1h: 0,
        timestamp: 0,
      };
      const yesterday: HistoryResDto = {
        temp: 13,
        code: undefined,
        rain1h: 0,
        timestamp: 0,
      };

      // when
      const tempString = SummaryService.getTempString(current, yesterday);

      // then
      const n = current.temp - yesterday.temp;
      expect(tempString).toBe(`어제보다 ${n}도 덜 춥습니다. `);
    });

    it('[success] 5. 비슷하게 더움', async () => {
      // given
      const current: CurrentResDto = {
        temp: 15,
        code: undefined,
        rain1h: 0,
        timestamp: 0,
      };
      const yesterday: HistoryResDto = {
        temp: 15,
        code: undefined,
        rain1h: 0,
        timestamp: 0,
      };

      // when
      const tempString = SummaryService.getTempString(current, yesterday);

      // then
      expect(tempString).toBe(`어제와 비슷하게 덥습니다. `);
    });

    it('[success] 6. 비슷하게 추움', async () => {
      // given
      const current: CurrentResDto = {
        temp: 14,
        code: undefined,
        rain1h: 0,
        timestamp: 0,
      };
      const yesterday: HistoryResDto = {
        temp: 14,
        code: undefined,
        rain1h: 0,
        timestamp: 0,
      };

      // when
      const tempString = SummaryService.getTempString(current, yesterday);

      // then
      expect(tempString).toBe(`어제와 비슷하게 춥습니다. `);
    });
  });

  describe('static getTempMinMaxString', () => {
    it('[success] min, max', async () => {
      // given
      const current: CurrentResDto = {
        temp: 14,
        code: undefined,
        rain1h: 0,
        timestamp: 0,
      };

      const history: HistoryResDto[] = [
        {
          code: undefined,
          rain1h: 0,
          temp: 5, // min
          timestamp: 0,
        },
        {
          code: undefined,
          rain1h: 0,
          temp: 25, // max
          timestamp: 0,
        },
        {
          code: undefined,
          rain1h: 0,
          temp: 15,
          timestamp: 0,
        },
      ];

      // when
      const minMaxString = SummaryService.getTempMinMaxString(current, history);

      // then
      expect(minMaxString).toBe(`최고기온은 ${25}도, 최저기온은 ${5}도 입니다.`);
    });
  });

  describe('static getHeadsUp', () => {
    it('0. 24시간내 폭설', async () => {
      // given
      const forecast: ForecastResDto[] = [
        {
          code: WeatherCode.SNOW,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.SNOW,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
      ];

      // when
      const headsUp = SummaryService.getHeadsUp(forecast);

      // then
      expect(headsUp).toBe(SummaryService.headUps[0]);
    });

    it('1. 48시간내 눈', async () => {
      // given
      const forecast: ForecastResDto[] = [
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.SNOW,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.SNOW,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
      ];

      // when
      const headsUp = SummaryService.getHeadsUp(forecast);

      // then
      expect(headsUp).toBe(SummaryService.headUps[1]);
    });

    it('2. 24시간내 비', async () => {
      // given
      const forecast: ForecastResDto[] = [
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.RAIN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.RAIN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.SNOW,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
      ];

      // when
      const headsUp = SummaryService.getHeadsUp(forecast);

      // then
      expect(headsUp).toBe(SummaryService.headUps[2]);
    });

    it('3. 48시간내 비', async () => {
      // given
      const forecast: ForecastResDto[] = [
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.RAIN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.SNOW,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.RAIN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
      ];

      // when
      const headsUp = SummaryService.getHeadsUp(forecast);

      // then
      expect(headsUp).toBe(SummaryService.headUps[3]);
    });

    it('4. 그외', async () => {
      // given
      const forecast: ForecastResDto[] = [
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.RAIN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.SNOW,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLEAN,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
        {
          code: WeatherCode.CLOUD,
          min_temp: 14,
          max_temp: 20,
          rain: 0,
          timestamp: 0,
        },
      ];

      // when
      const headsUp = SummaryService.getHeadsUp(forecast);

      // then
      expect(headsUp).toBe(SummaryService.headUps[4]);
    });
  });
});
