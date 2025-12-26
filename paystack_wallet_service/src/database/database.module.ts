import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '../entities/transaction.entity';
import { ApiKey } from '../entities/api-key.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: parseInt(configService.get('DB_PORT') || '5432', 10),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: [User, Wallet, Transaction, ApiKey],
            synchronize: true,
            // synchronize: false,
            logging: configService.get('NODE_ENV') === 'development',
            extra: {
                ssl: {
                  rejectUnauthorized: false,
                },
                max: 20,
                connectionTimeoutMillis: 10000,
            },
            }),

      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Wallet, Transaction, ApiKey]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}