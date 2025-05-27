import dotenv from 'dotenv';
import { z } from 'zod';


dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    MONGODB_URI: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string().default('1d'),
    BITNOB_API_KEY: z.string(),
    BITNOB_BASE_URL: z.string().default('https://api.bitnob.co/api/v1'),
    RATE_LIMIT_WINDOW_MS: z.string().default('15 * 60 * 1000'), // 15 minutes
    RATE_LIMIT_MAX: z.string().default('100'),
  });



  const env = envSchema.safeParse(process.env);
  if(!env.success){
    console.log('Invalid environmen variables: ', env.error.format());
    process.exit(1);
  }

  export default env.data;

