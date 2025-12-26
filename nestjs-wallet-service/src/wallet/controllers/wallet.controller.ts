import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { FundWalletDto } from '../dto/fund-wallet.dto';
import { TransferDto } from '../dto/transfer.dto';
import { WalletsService } from '../services/wallet.service';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWallet(@Body() createWalletDto: CreateWalletDto) {
    return await this.walletsService.createWallet(createWalletDto);
  }

  @Post('fund')
  @HttpCode(HttpStatus.OK)
  async fundWallet(@Body() fundWalletDto: FundWalletDto) {
    return await this.walletsService.fundWallet(fundWalletDto);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  async transfer(@Body() transferDto: TransferDto) {
    return await this.walletsService.transferFunds(transferDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getWalletDetails(@Param('id') walletId: string) {
    return await this.walletsService.getWalletDetails(walletId);
  }
}