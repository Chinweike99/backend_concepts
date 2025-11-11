import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { IsNull, Like, Not, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { last, lastValueFrom } from 'rxjs';
import { ExchangeRates, RestCountry } from './interfaces/external-api.interface';
import { CreateCountryDto } from './dto/create-country.dto';
import { CountryQueryDto } from './dto/country-query.dto';
import path from 'path';
import * as fs from 'fs';
import { createCanvas } from 'canvas';

@Injectable()
export class CountriesService {

    private readonly logger = new Logger(CountriesService.name);
    private lastRefreshTimestamp: Date | null = null;

    constructor(
        @InjectRepository(Country)
        private countriesRepository: Repository<Country>,
        private httpService: HttpService
    ){}

    async refreshCountries(): Promise<{message: string; count: number}> {
   try {
             this.logger.log("Starting countries rerfresh ...");

        const countriesUrl = 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
        console.log("Fetching countries from:", countriesUrl);

        const countriesResponse = await lastValueFrom(
            this.httpService.get<RestCountry[]>(countriesUrl)
        );
        const countriesData = countriesResponse.data;

        // Fetch exchange rates
        const exchangeUrl = 'https://open.er-api.com/v6/latest/USD';
        console.log("Fetching exchange rates from:", exchangeUrl);
        const exchangeResponse = await lastValueFrom(
            this.httpService.get<ExchangeRates>(exchangeUrl)
        );

        const exchangeRates = exchangeResponse.data.rates;

        let processedCount = 0;

        for(const countryData of countriesData){
            try {
                let currencyCode: string | null = null;
                let exchangeRate: number | null = null;

                if(countryData.currencies && countryData.currencies.length > 0){
                    currencyCode = countryData.currencies[0].code;

                    // Get exchang rate if currency code exists
                    if(currencyCode && exchangeRates[currencyCode]){
                        exchangeRate = exchangeRates[currencyCode]
                    }
                }

                // Calculate estimated GDP
                const randomMultiplier = Math.floor(Math.random() * 1001) + 1000;
                let estimatedGdp: number | null = null;

                if(exchangeRate && currencyCode){
                    estimatedGdp = (countryData.population * randomMultiplier) / exchangeRate;
                };

                const countryDto: CreateCountryDto = {
                    name: countryData.name,
                    capital: countryData.capital,
                    region: countryData.region,
                    population: countryData.population,
                    currency_code: currencyCode!,
                    exchange_rate: exchangeRate!,
                    estimated_gdp: estimatedGdp!,
                    flag_url: countryData.flag,
                }

                // Check if country exists
                const existingCountry = await this.countriesRepository.findOne({
                    where: {name: countryData.name}
                });

                if(existingCountry){
                    await this.countriesRepository.update(existingCountry.id, {
                        ...countryDto,
                        last_refreshed_at: new Date()
                    })
                }else {
                    const newCountry = this.countriesRepository.create({
                        ...countryDto,
                        last_refreshed_at: new Date()
                    });
                    await this.countriesRepository.save(newCountry)
                }
                
                processedCount++;

            } catch (error) {
                this.logger.error(`Error processing country ${countryData.name}:`, error);
            }
        }

            this.lastRefreshTimestamp = new Date();

            // Generate summary image
            await this.generateSummaryImage();

            this.logger.log(`Successfully refreshed ${processedCount} countries`);
            return { message: 'Countries refreshed successfully', count: processedCount };
   } catch (error) {
          this.logger.error('Error refreshing countries:', error);
      
      if (error.response) {
        throw new HttpException(
          {
            error: 'External data source unavailable',
            details: `Could not fetch data from ${error.config?.url?.includes('restcountries') ? 'Countries API' : 'Exchange Rates API'}`,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async findAll(query: CountryQueryDto): Promise<Country[]>{
    const { region, currency, sort } = query;

    const where: any = {};

    if(region){
        where.region = Like(`%${region}%`);
    };

    if(currency){
        where.currency_code = currency;
    };

    const order: any = {};
    if (sort) {
      switch (sort) {
        case 'name_asc':
          order.name = 'ASC';
          break;
        case 'name_desc':
          order.name = 'DESC';
          break;
        case 'gdp_asc':
          order.estimated_gdp = 'ASC';
          break;
        case 'gdp_desc':
          order.estimated_gdp = 'DESC';
          break;
        case 'population_asc':
          order.population = 'ASC';
          break;
        case 'population_desc':
          order.population = 'DESC';
          break;
        default:
          order.name = 'ASC';
      }
    } else {
      order.name = 'ASC';
    }

    return this.countriesRepository.find({
        where,
        order
    })
  };

  async findOne(name: string): Promise<Country> {
    const country = await this.countriesRepository.findOne({
      where: { name: Like(`%${name}%`) },
    });

    if (!country) {
      throw new HttpException('Country not found', HttpStatus.NOT_FOUND);
    }

    return country;
  }

    async remove(name: string): Promise<{ message: string }> {
    const country = await this.countriesRepository.findOne({
      where: { name: Like(`%${name}%`) },
    });

    if (!country) {
      throw new HttpException('Country not found', HttpStatus.NOT_FOUND);
    }

    await this.countriesRepository.delete(country.id);
    return { message: 'Country deleted successfully' };
  }

    async getStatus(): Promise<{ total_countries: number; last_refreshed_at: Date | null }> {
    const totalCountries = await this.countriesRepository.count();
    
    // Get the most recent last_refreshed_at from any country
    const mostRecentCountry = await this.countriesRepository.findOne({
      where: { last_refreshed_at: Not(IsNull()) },
      order: { last_refreshed_at: 'DESC' },
    });

    return {
      total_countries: totalCountries,
      last_refreshed_at: mostRecentCountry?.last_refreshed_at || null,
    };
  }

  async getSummaryImage(): Promise<Buffer> {
    const cacheDir = path.join(process.cwd(), 'cache');
    const imagePath = path.join(cacheDir, 'summary.png');

    if(!fs.existsSync(imagePath)) {
        throw new HttpException(`Summary image not found`, HttpStatus.NOT_FOUND)
    }
    return fs.readFileSync(imagePath)
  };


 private async generateSummaryImage(): Promise<void> {
    try {
      // Get top 5 countries by GDP
      const topCountries = await this.countriesRepository.find({
        where: { estimated_gdp: Not(IsNull()) },
        order: { estimated_gdp: 'DESC' },
        take: 5,
      });

      const totalCountries = await this.countriesRepository.count();

      // Create canvas
      const canvas = createCanvas(800, 600);
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, 800, 600);

      // Title
      ctx.fillStyle = '#343a40';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Countries Summary', 400, 60);

      // Total countries
      ctx.font = '20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Total Countries: ${totalCountries}`, 50, 120);

      // Last refresh
      ctx.fillText(`Last Refresh: ${new Date().toLocaleString()}`, 50, 150);

      // Top countries header
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Top 5 Countries by Estimated GDP:', 50, 200);

      // Top countries list
      ctx.font = '18px Arial';
      let yPosition = 240;
      
      topCountries.forEach((country, index) => {
        const gdpFormatted = country.estimated_gdp 
          ? `$${country.estimated_gdp.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          : 'N/A';
        
        ctx.fillText(
          `${index + 1}. ${country.name}: ${gdpFormatted}`,
          70,
          yPosition
        );
        yPosition += 30;
      });

      // Ensure cache directory exists
      const cacheDir = path.join(process.cwd(), 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // Save image
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(path.join(cacheDir, 'summary.png'), buffer);

      this.logger.log('Summary image generated successfully');
    } catch (error) {
      this.logger.error('Error generating summary image:', error);
    }
  }

}
