import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { CurrentResDto, ForecastResDto, HistoryResDto } from '@src/summary/dto/weather.dto';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BASE_URL = 'https://thirdparty-weather-api-v2.droom.workers.dev';

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private axios_: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.apiKey = configService.get<string>('weather.apiKey');

    const axiosConfig: AxiosRequestConfig = {
      baseURL: BASE_URL,
      timeout: 10000,
      responseType: 'json',
    };
    this.axios_ = axios.create(axiosConfig);
  }

  async getCurrent(lat: number, lon: number): Promise<CurrentResDto> {
    const spec: AxiosRequestConfig = {
      method: 'GET',
      url: `/current?lat=${lat}&lon=${lon}&api_key=${this.apiKey}`,
    };

    const result: AxiosResponse = await this.axios_.request(spec);

    return result.data;
  }

  async getHistory(lat: number, lon: number, hourOffset: number): Promise<HistoryResDto> {
    const spec: AxiosRequestConfig = {
      method: 'GET',
      url: `/historical/hourly?lat=${lat}&lon=${lon}&hour_offset=${hourOffset}&api_key=${this.apiKey}`,
    };

    const result: AxiosResponse = await this.axios_.request(spec);

    return result.data;
  }

  async getForecast(lat: number, lon: number, hourOffset: number): Promise<ForecastResDto> {
    const spec: AxiosRequestConfig = {
      method: 'GET',
      url: `/forecast/hourly?lat=${lat}&lon=${lon}&hour_offset=${hourOffset}&api_key=${this.apiKey}`,
    };

    const result: AxiosResponse = await this.axios_.request(spec);

    return result.data;
  }

  // for unit testing
  setAxiosInstance(axiosInstance: AxiosInstance) {
    this.axios_ = axiosInstance;
  }
}
