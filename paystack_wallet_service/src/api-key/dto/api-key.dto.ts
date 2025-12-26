import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

const permissionEnum = ['read', 'deposit', 'transfer'] as const;

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.enum(permissionEnum)).min(1),
  expiry: z.enum(['1H', '1D', '1M', '1Y']),
});

export class CreateApiKeyDto {
  @ApiProperty({ example: 'Wallet Service', description: 'Name for the API key' })
  name: string;

  @ApiProperty({
    example: ['read', 'deposit', 'transfer'],
    description: 'Permissions for the API key',
    enum: ['read', 'deposit', 'transfer'],
    isArray: true,
  })
  permissions: string[];

  @ApiProperty({
    example: '1M',
    description: 'Expiry duration (1H, 1D, 1M, 1Y)',
    enum: ['1H', '1D', '1M', '1Y'],
  })
  expiry: string;
}