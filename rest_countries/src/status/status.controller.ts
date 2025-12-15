import { Controller, Get } from '@nestjs/common';
import { CountriesService } from '../countries/countries.service';

@Controller('status')
export class StatusController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  async getStatus() {
    return this.countriesService.getStatus();
  }
}