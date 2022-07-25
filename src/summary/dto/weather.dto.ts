export enum WeatherCode {
  CLEAN = 0,
  CLOUD = 1,
  RAIN = 2,
  SNOW = 3,
}

export type CurrentResDto = {
  timestamp: number; // unix time (seconds)
  code: WeatherCode; // 날씨 상태. 0: 맑음, 1: 흐림, 2: 비, 3:눈
  temp: number; // 현재 기온 (Celsius)
  rain1h: number; // 시간당 강수량 (mm). 최저 0.
};

export type HistoryResDto = CurrentResDto;

export type ForecastResDto = {
  timestamp: number;
  code: 0 | 1 | 2 | 3;
  min_temp: number; // 최저 기온 (Celsius)
  max_temp: number; // 최고 기온 (Celsius)
  rain: number; // 강수확률 (%). 최저 0, 최고 100.
};
