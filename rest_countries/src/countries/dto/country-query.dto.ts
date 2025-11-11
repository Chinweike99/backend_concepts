import { IsOptional, IsString, IsIn } from 'class-validator';

export class CountryQueryDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsIn(['name_asc', 'name_desc', 'gdp_asc', 'gdp_desc', 'population_asc', 'population_desc'])
  sort?: string;
}