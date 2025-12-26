import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const transferSchema = z.object({
  wallet_number: z.string().length(13, 'Wallet number must be 13 digits'),
  amount: z.number().positive().min(1).max(10000000),
});

export class TransferDto {
  @ApiProperty({ 
    example: '4566678954356', 
    description: 'Recipient wallet number (13 digits)'
  })
  wallet_number: string;

  @ApiProperty({ 
    example: 3000, 
    description: 'Amount to transfer',
    minimum: 1,
    maximum: 10000000
  })
  amount: number;
}