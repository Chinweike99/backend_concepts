import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { DatabaseModule } from '../database/database.module';
import { ApiKeyModule } from '../api-key/api-key.module';
import { AuthModule } from '../auth/auth.module';
import { PaystackService } from './services/paystack.service';
import { WalletController } from './wallet.controller';

@Module({
  imports: [DatabaseModule, ApiKeyModule, AuthModule],
  controllers: [WalletController],
  providers: [WalletService, PaystackService],
  exports: [WalletService],
})
export class WalletModule {}