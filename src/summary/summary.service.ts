import { Injectable } from '@nestjs/common';
import { countBy, maxBy, minBy } from 'lodash';

import { SummaryResponseDto } from '@src/summary/dto/summary.dto';
import { CurrentResDto, ForecastResDto, HistoryResDto, WeatherCode } from '@src/summary/dto/weather.dto';
import { WeatherService } from '@src/summary/weather.service';

@Injectable()
export class SummaryService {
  static greetings = [
    '폭설이 내리고 있어요.',
    '눈이 포슬포슬 내립니다.', // 1
    '폭우가 내리고 있어요.',
    '비가 오고 있습니다.', // 3
    '날씨가 약간은 칙칙해요.',
    '따사로운 햇살을 맞으세요.', // 5
    '따사로운 햇살을 맞으세요.',
    '따사로운 햇살을 맞으세요.', // 7
  ];

  static headUps = [
    '내일 폭설이 내릴 수도 있으니 외출 시 주의하세요.',
    '눈이 내릴 예정이니 외출 시 주의하세요.',
    '폭우가 내릴 예정이에요. 우산을 미리 챙겨두세요.',
    '며칠동안 비 소식이 있어요.',
    '날씨는 대체로 평온할 예정이에요.',
  ];

  constructor(private readonly weatherService: WeatherService) {}

  static getGreeting(current: CurrentResDto) {
    // | 우선순위 | 조건 | 문구 |
    // | 0 | 현재 날씨가 눈 이며 강수량이 100mm 이상인 경우 | 폭설이 내리고 있어요. |
    if (current.code == WeatherCode.SNOW && current.rain1h >= 100) {
      return SummaryService.greetings[0];
    }
    // | 1 | 현재 날씨가 눈인 경우 | 눈이 포슬포슬 내립니다. |
    if (current.code == WeatherCode.SNOW) {
      return SummaryService.greetings[1];
    }
    // | 2 | 현재 날씨가 비 이며, 강수량이 100mm 이상인 경우 | 폭우가 내리고 있어요. |
    if (current.code == WeatherCode.RAIN && current.rain1h >= 100) {
      return SummaryService.greetings[2];
    }
    // | 3 | 현재 날씨가 비인 경우 | 비가 오고 있습니다. |
    if (current.code == WeatherCode.RAIN) {
      return SummaryService.greetings[3];
    }
    // | 4 | 현재 날씨가 흐림인 경우 | 날씨가 약간은 칙칙해요. |
    if (current.code == WeatherCode.CLOUD) {
      return SummaryService.greetings[4];
    }
    // | 5 | 현재 날씨가 맑고, 현재 온도가 30도 이상인 경우 | 따사로운 햇살을 맞으세요. |
    if (current.code == WeatherCode.CLEAN && current.temp >= 30) {
      return SummaryService.greetings[5];
    }
    // | 6 | 현재 온도가 0도 이하인 경우 | 날이 참 춥네요. |
    if (current.temp <= 0) {
      return SummaryService.greetings[6];
    }
    // | 7 | 그 외 | 날씨가 참 맑습니다. |
    return SummaryService.greetings[7];
  }

  /* history[0] -6시
   * history[1] -12시
   * history[2] -18시
   * history[3] -24시
   */
  static getTemperature(current: CurrentResDto, history: HistoryResDto[]) {
    let tempString = '';

    const yesterday = history[3]; // -24시

    tempString = SummaryService.getTempString(current, yesterday);
    tempString += SummaryService.getTempMinMaxString(current, history);

    return tempString;
  }

  /* 앞으로 48시간 동안 (총 8개의 데이터포인트) 의 예보를 토대로 우선순위 상위 (0) 부터 검사하여 가장 적절한 문구를 하나 선정합니다.
   *
   * forecast48[0] : 6시
   * forecast48[1] : 12시
   * forecast48[2] : 18시
   * forecast48[3] : 24시
   * forecast48[4] : 30시
   * forecast48[5] : 36시
   * forecast48[6] : 42시
   * forecast48[7] : 48시
   */
  static getHeadsUp(forecast48: ForecastResDto[]) {
    const forecast24 = forecast48.slice(0, 4);

    const forecast24ByCode = countBy<ForecastResDto>(forecast24, 'code'); // code 별 갯수
    const forecast48ByCode = countBy<ForecastResDto>(forecast48, 'code');

    // | 0 | 앞으로 24시간 내에 눈이 내릴 것으로 예측되는 경우가 12시간 이상 | 내일 폭설이 내릴 수도 있으니 외출 시 주의하세요. |
    if (forecast24ByCode[WeatherCode.SNOW] >= 2) {
      return SummaryService.headUps[0];
    }
    // | 1 | 앞으로 48시간 내에 눈이 내릴 것으로 예측되는 경우가 12시간 이상 | 눈이 내릴 예정이니 외출 시 주의하세요. |
    if (forecast48ByCode[WeatherCode.SNOW] >= 2) {
      return SummaryService.headUps[1];
    }
    // | 2 | 앞으로 24시간 내에 비가 내릴 것으로 예측되는 경우가 12시간 이상 | 폭우가 내릴 예정이에요. 우산을 미리 챙겨두세요. |
    if (forecast24ByCode[WeatherCode.RAIN] >= 2) {
      return SummaryService.headUps[2];
    }
    // | 3 | 앞으로 48시간 이내에 비가 내릴 것으로 예측되는 경우가 12시간 이상 | 며칠동안 비 소식이 있어요. |
    if (forecast48ByCode[WeatherCode.RAIN] >= 2) {
      return SummaryService.headUps[3];
    }

    // | 4 | 그 외 | 날씨는 대체로 평온할 예정이에요. |
    return '날씨는 대체로 평온할 예정이에요.';
  }

  static getTempString(current: CurrentResDto, yesterday: HistoryResDto) {
    let tempString = '';

    // | 온도가 n도 더 내려갔고 현재 온도가 15도 이상임 | 어제보다 n도 덜 덥습니다. |
    if (current.temp < yesterday.temp && current.temp >= 15) {
      const n = yesterday.temp - current.temp;
      tempString = `어제보다 ${n}도 덜 덥습니다. `;
    }
    // | 온도가 n도 더 내려갔고 현재 온도가 15도 미만임 | 어제보다 n도 더 춥습니다. |
    else if (current.temp < yesterday.temp && current.temp < 15) {
      const n = yesterday.temp - current.temp;
      tempString = `어제보다 ${n}도 더 춥습니다. `;
    }
    // | 온도가 n도 더 높아졌고 현재 온도가 15도 이상임 | 어제보다 n도 더 덥습니다. |
    else if (current.temp > yesterday.temp && current.temp >= 15) {
      const n = current.temp - yesterday.temp;
      tempString = `어제보다 ${n}도 더 덥습니다. `;
    }
    // | 온도가 n도 더 높아졌고 현재 온도가 15도 미만임 | 어제보다 n도 덜 춥습니다. |
    else if (current.temp > yesterday.temp && current.temp < 15) {
      const n = current.temp - yesterday.temp;
      tempString = `어제보다 ${n}도 덜 춥습니다. `;
    }
    // | 온도가 같고 그 온도가 15도 이상임 | 어제와 비슷하게 덥습니다. |
    else if (current.temp == yesterday.temp && current.temp >= 15) {
      tempString = '어제와 비슷하게 덥습니다. ';
    }
    // | 온도가 같고 그 온도가 15도 미만임 | 어제와 비슷하게 춥습니다. |
    else if (current.temp == yesterday.temp && current.temp < 15) {
      tempString = '어제와 비슷하게 춥습니다. ';
    }

    return tempString;
  }

  static getTempMinMaxString(current: CurrentResDto, history: HistoryResDto[]) {
    const minTemp = minBy<CurrentResDto>([current, ...history], (e) => e.temp);
    const maxTemp = maxBy<CurrentResDto>([current, ...history], (e) => e.temp);
    return `최고기온은 ${maxTemp.temp}도, 최저기온은 ${minTemp.temp}도 입니다.`;
  }

  async getSummary(lat: number, lon: number): Promise<SummaryResponseDto> {
    const result = await Promise.all([
      this.weatherService.getCurrent(lat, lon),
      this.weatherService.getHistory(lat, lon, -6),
      this.weatherService.getHistory(lat, lon, -6 * 2), // -12h
      this.weatherService.getHistory(lat, lon, -6 * 3), // -18h
      this.weatherService.getHistory(lat, lon, -6 * 4), // -24h
      this.weatherService.getForecast(lat, lon, 6),
      this.weatherService.getForecast(lat, lon, 6 * 2),
      this.weatherService.getForecast(lat, lon, 6 * 3),
      this.weatherService.getForecast(lat, lon, 6 * 4), // 24h
      this.weatherService.getForecast(lat, lon, 6 * 5),
      this.weatherService.getForecast(lat, lon, 6 * 6),
      this.weatherService.getForecast(lat, lon, 6 * 7),
      this.weatherService.getForecast(lat, lon, 6 * 8), // 48h
    ]);

    const current: CurrentResDto = result[0];
    const history = result.slice(1, 5) as HistoryResDto[];
    const forecast = result.slice(5) as ForecastResDto[];

    return {
      summary: {
        greeting: SummaryService.getGreeting(current),
        temperature: SummaryService.getTemperature(current, history),
        'heads-up': SummaryService.getHeadsUp(forecast),
      },
    };
  }
}
