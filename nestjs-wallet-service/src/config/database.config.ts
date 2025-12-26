import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'wallet_user',
  password: process.env.DB_PASSWORD || 'wallet_password',
  database: process.env.DB_NAME || 'wallet_db',
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV !== 'production', 
  logging: process.env.NODE_ENV !== 'production',
};