import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const depositSchema = z.object({
  amount: z.number().positive().min(100).max(10000000),
});

export class DepositDto {
  @ApiProperty({ 
    example: 5000, 
    description: 'Amount to deposit in kobo (100 kobo = 1 NGN). Example: 5000 kobo = 50 NGN',
    minimum: 100,
    maximum: 10000000
  })
  amount: number;
}