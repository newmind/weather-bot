import { Module } from '@nestjs/common';

import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { WeatherService } from './weather.service';

@Module({
  controllers: [SummaryController],
  providers: [SummaryService, WeatherService],
})
export class SummaryModule {}
