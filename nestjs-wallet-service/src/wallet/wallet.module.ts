import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from 'src/entities/wallet.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { WalletsController } from './controllers/wallet.controller';
import { WalletsService } from './services/wallet.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction]),
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}