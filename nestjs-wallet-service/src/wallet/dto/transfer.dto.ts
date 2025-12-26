import { IsUUID, IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class TransferDto {
  @IsUUID(4, { message: 'senderWalletId not found' })
  senderWalletId: string;

  @IsUUID(4, { message: 'receiverWalletId not found' })
  receiverWalletId: string;

  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}