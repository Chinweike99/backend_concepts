import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const rolloverApiKeySchema = z.object({
  expiredKeyId: z.string().uuid(),
  expiry: z.enum(['1H', '1D', '1M', '1Y']),
});

export class RolloverApiKeyDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID of the expired API key' })
  expiredKeyId: string;

  @ApiProperty({
    example: '1M',
    description: 'New expiry duration',
    enum: ['1H', '1D', '1M', '1Y'],
  })
  expiry: string;
}