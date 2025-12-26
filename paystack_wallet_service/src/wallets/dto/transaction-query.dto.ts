import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const transactionsQuerySchema = z.object({
  limit: z.string().optional().default('20').transform(Number).refine(n => n >= 1 && n <= 100),
  page: z.string().optional().default('1').transform(Number).refine(n => n >= 1),
  type: z.enum(['deposit', 'transfer', 'withdrawal']).optional(),
  status: z.enum(['pending', 'success', 'failed']).optional(),
});

export class TransactionsQueryDto {
  @ApiProperty({ 
    required: false, 
    default: '20',
    minimum: 1,
    maximum: 100
  })
  limit?: string;

  @ApiProperty({ 
    required: false, 
    default: '1',
    minimum: 1
  })
  page?: string;

  @ApiProperty({ 
    required: false,
    enum: ['deposit', 'transfer', 'withdrawal']
  })
  type?: string;

  @ApiProperty({ 
    required: false,
    enum: ['pending', 'success', 'failed']
  })
  status?: string;
}