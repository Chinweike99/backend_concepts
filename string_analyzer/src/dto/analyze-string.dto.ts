import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AnalyzeStringDto {
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class FilterStringsDto {
  @IsOptional()
  @IsString()
  is_palindrome?: string;

  @IsOptional()
  @IsString()
  min_length?: string;

  @IsOptional()
  @IsString()
  max_length?: string;

  @IsOptional()
  @IsString()
  word_count?: string;

  @IsOptional()
  @IsString()
  contains_character?: string;
}

export class NaturalLanguageFilterDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}