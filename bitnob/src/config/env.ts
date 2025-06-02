import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
    JWT_SECRET: z.string().min(1, 'JWT Secret is required'), // Ensure it's not empty
    JWT_EXPIRES_IN: z.string().default('1d'),
    BITNOB_API_KEY: z.string().min(1, 'Bitnob API key is required'),
    BITNOB_BASE_URL: z.string().default('https://api.bitnob.co/api/v1'),
    RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes in ms
    RATE_LIMIT_MAX: z.string().default('100'),
});

const env = envSchema.safeParse(process.env);
if (!env.success) {
    console.log('Invalid environment variables: ', env.error.format());
    process.exit(1);
}

export default env.data;