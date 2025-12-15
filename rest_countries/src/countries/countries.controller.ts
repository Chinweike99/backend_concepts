import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Res,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import type { Response } from 'express';

import { CountriesService } from './countries.service';
import { CountryQueryDto } from './dto/country-query.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post('refresh')
  async refresh() {
    return this.countriesService.refreshCountries();
  }

  @Get()
  async findAll(@Query() query: CountryQueryDto) {
    return this.countriesService.findAll(query);
  }


    @Get('image')
  async getImage(@Res() res: Response) {
    try {
      const imageBuffer = await this.countriesService.getSummaryImage();
      
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length,
      });
      
      res.send(imageBuffer);
    } catch (error) {
      if (error.getStatus && error.getStatus() === HttpStatus.NOT_FOUND) {
        return res.status(HttpStatus.NOT_FOUND).json({
          error: 'Summary image not found',
        });
      }
      throw error;
    }
  }

  @Get(':name')
  async findOne(@Param('name') name: string) {
    return this.countriesService.findOne(name);
  }

  @Delete(':name')
  async remove(@Param('name') name: string) {
    return this.countriesService.remove(name);
  }

}