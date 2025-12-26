import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiHeader,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { DepositDto, depositSchema } from './dto/deposit.dto';
import { TransferDto, transferSchema } from './dto/transfer.dto';
import { Permission } from '../entities/api-key.entity';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { PaystackService } from './services/paystack.service';
import { WalletService } from './wallet.service';
import { CompositeAuthGuard } from '../auth/strategy/composite-auth.guard';
import { Permissions } from '../api-key/decorators/permission.decorators';
import { Public } from '../auth/decorators/public.decorator';
import { transactionsQuerySchema, TransactionsQueryDto } from './dto/transaction-query.dto';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(
    private walletService: WalletService,
    private paystackService: PaystackService,
  ) {}

  @Post('deposit')
  @UseGuards(CompositeAuthGuard)
  @Permissions(Permission.DEPOSIT)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-key')
  @ApiOperation({ summary: 'Initialize a deposit transaction' })
  @ApiResponse({ status: 200, description: 'Deposit initialized successfully' })
  @ApiResponse({ status: 400, description: 'Invalid amount' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiBody({ type: DepositDto })
  async deposit(
    @Request() req,
    @Body() body: any,
  ) {
    const depositDto = new ZodValidationPipe(depositSchema).transform(body) as DepositDto;
    return this.walletService.initializeDeposit(
      req.user.id,
      depositDto.amount,
    );
  }

  @Get('balance')
  @UseGuards(CompositeAuthGuard)
  @Permissions(Permission.READ)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-key')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async getBalance(@Request() req) {
    return this.walletService.getBalance(req.user.id);
  }

  @Post('transfer')
  @UseGuards(CompositeAuthGuard)
  @Permissions(Permission.TRANSFER)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-key')
  @ApiOperation({ summary: 'Transfer funds to another wallet' })
  @ApiResponse({ status: 200, description: 'Transfer completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid transfer request' })
  @ApiBody({ type: TransferDto })
  async transfer(
    @Request() req,
    @Body() body: any,
  ) {
    const transferDto = new ZodValidationPipe(transferSchema).transform(body) as TransferDto;
    return this.walletService.transferFunds(
      req.user.id,
      transferDto.wallet_number,
      transferDto.amount,
    );
  }

  @Get('transactions')
  @UseGuards(CompositeAuthGuard)
  @Permissions(Permission.READ)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-key')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ['deposit', 'transfer', 'withdrawal'] })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'success', 'failed'] })
  async getTransactions(
    @Request() req,
    @Query() query: any,
  ) {
    const validatedQuery = new ZodValidationPipe(transactionsQuerySchema).transform(query) as unknown as TransactionsQueryDto;
    return this.walletService.getTransactionHistory(
      req.user.id,
      {
        limit: validatedQuery.limit as any,
        page: validatedQuery.page as any,
        type: validatedQuery.type as any,
        status: validatedQuery.status as any,
      },
    );
  }

  @Get('list')
  @UseGuards(CompositeAuthGuard)
  @Permissions(Permission.READ)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-key')
  @ApiOperation({ summary: 'Get wallet details with recent transactions' })
  async getWalletDetails(@Request() req) {
    return this.walletService.getWalletDetails(req.user.id);
  }

  @Get('deposit/:reference/status')
  @UseGuards(CompositeAuthGuard)
  @Permissions(Permission.READ)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-key')
  @ApiOperation({ summary: 'Check deposit status' })
  @ApiResponse({ status: 200, description: 'Status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getDepositStatus(
    @Request() req,
    @Param('reference') reference: string,
  ) {
    return this.walletService.verifyDepositStatus(reference, req.user.id);
  }

  @Get('deposit/callback')
  @Public()
  @ApiOperation({ summary: 'Paystack deposit callback' })
  @ApiResponse({ status: 200, description: 'Payment verification result' })
  async depositCallback(
    @Query('reference') reference: string,
    @Query('trxref') trxref: string,
  ) {
    // Use reference or trxref (Paystack can send either)
    const ref = reference || trxref;
    
    if (!ref) {
      return {
        status: 'error',
        message: 'No transaction reference provided',
      };
    }

    try {
      const result = await this.paystackService.verifyTransaction(ref);
      
      if (result.status) {
        await this.walletService.processDepositCallback(ref);
        
        return {
          status: 'success',
          message: 'Payment verified and wallet credited successfully',
          data: result,
        };
      }
      
      return {
        status: 'failed',
        message: 'Payment verification failed',
        data: result,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Payment verification failed',
      };
    }
  }

  @Post('paystack/webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paystack webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() payload: any,
  ) {
    if (process.env.NODE_ENV === 'production') {
      const isValid = this.paystackService.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    await this.walletService.handleWebhookEvent(payload);
    return { status: true };
  }
}