import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateWalletDto {
  @IsOptional()
  @IsString()
  @IsEnum(['USD', 'EUR', 'NGN'], {
    message: 'currency must be one of the following values: USD, EUR, NGN',
  })
  currency?: string;
}