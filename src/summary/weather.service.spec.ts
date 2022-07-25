import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosInstance } from 'axios';

import { WeatherService } from './weather.service';

import { mock } from '@src/test/mock.util';

describe('WeatherService', () => {
  let service: WeatherService;
  let axiosMock: jest.Mocked<AxiosInstance>;

  beforeEach(async () => {
    axiosMock = mock<AxiosInstance>('request');
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeatherService, ConfigService],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    service.setAxiosInstance(axiosMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrent', () => {
    it('should call axios.request', async () => {
      axiosMock.request.mockResolvedValueOnce({ data: 'dummy' });

      const data = await service.getCurrent(-1, 1);

      expect(axiosMock.request).toBeCalledTimes(1);
      expect(data).toBe('dummy');
    });
  });

  describe('getHistory', () => {
    it('should call axios.requst', async () => {
      axiosMock.request.mockResolvedValueOnce({ data: 'dummy' });

      const data = await service.getHistory(-1, 1, 6);

      expect(axiosMock.request).toBeCalledTimes(1);
      expect(data).toBe('dummy');
    });
  });

  describe('getForecast', () => {
    it('should call axios.requst', async () => {
      axiosMock.request.mockResolvedValueOnce({ data: 'dummy' });

      const data = await service.getForecast(-1, 1, 6);

      expect(axiosMock.request).toBeCalledTimes(1);
      expect(data).toBe('dummy');
    });
  });
});
