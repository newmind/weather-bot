import { Controller, Get, ParseFloatPipe, Query } from '@nestjs/common';

import { SummaryService } from './summary.service';

@Controller('/summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  async getSummary(@Query('lat', ParseFloatPipe) lat: number, @Query('lon', ParseFloatPipe) lon: number) {
    return this.summaryService.getSummary(lat, lon);
  }
}
