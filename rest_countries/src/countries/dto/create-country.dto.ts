import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCountryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  capital?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsNotEmpty()
  @IsNumber()
  population: number;

  @IsNotEmpty()
  @IsString()
  currency_code: string;

  @IsOptional()
  @IsNumber()
  exchange_rate?: number;

  @IsOptional()
  @IsNumber()
  estimated_gdp?: number;

  @IsOptional()
  @IsString()
  flag_url?: string;
}