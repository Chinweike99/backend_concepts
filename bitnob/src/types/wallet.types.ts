import { z } from 'zod';

export const activateWalletSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
});

export const sendCryptoSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    address: z.string().min(10),
    currency: z.string().default('BTC'),
    description: z.string().optional(),
  }),
});

export type ActivateWalletInput = z.infer<typeof activateWalletSchema>['params'];
export type SendCryptoInput = z.infer<typeof sendCryptoSchema>['body'];