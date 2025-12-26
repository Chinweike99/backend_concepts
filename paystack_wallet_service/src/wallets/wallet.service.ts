import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, In } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { PaystackService } from './services/paystack.service';
import { startOfDay, endOfDay, subDays } from 'date-fns';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private paystackService: PaystackService,
    private dataSource: DataSource,
  ) {}

  async getWallet(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async getBalance(userId: string): Promise<{ balance: number; currency: string }> {
    const wallet = await this.getWallet(userId);
    return { 
      balance: Number(wallet.balance) / 100, 
      currency: wallet.currency 
    };
  }

  async initializeDeposit(
    userId: string,
    amount: number,
  ): Promise<{ reference: string; authorization_url: string }> {
    if (amount < 100) { // Minimum 100 kobo = 1 NGN
      throw new BadRequestException('Minimum deposit amount is 1 NGN');
    }

    if (amount > 10000000) { // Maximum 100,000 NGN
      throw new BadRequestException('Maximum deposit amount is 100,000 NGN');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for pending transactions in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const pendingTransaction = await this.transactionRepository.findOne({
      where: {
        userId,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
        createdAt: Between(fiveMinutesAgo, new Date()),
      },
    });

    if (pendingTransaction) {
      // Return existing transaction details
      const verification = await this.paystackService.verifyTransaction(pendingTransaction.reference);
      if (verification.status) {
        // Transaction already completed via webhook
        await this.completeDeposit(pendingTransaction.reference);
        return {
          reference: pendingTransaction.reference,
          authorization_url: '',
        };
      }
      
      // Reinitialize with Paystack
      const paystackResponse = await this.paystackService.initializeTransaction(
        user.email,
        amount,
        {
          userId,
          transactionId: pendingTransaction.id,
        },
      );

      pendingTransaction.reference = paystackResponse.reference;
      await this.transactionRepository.save(pendingTransaction);

      return {
        reference: paystackResponse.reference,
        authorization_url: paystackResponse.authorization_url,
      };
    }

    // Create new pending transaction
    const transaction = this.transactionRepository.create({
      userId,
      walletId: (await this.getWallet(userId)).id,
      type: TransactionType.DEPOSIT,
      amount,
      status: TransactionStatus.PENDING,
      reference: `DEP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    await this.transactionRepository.save(transaction);

    // Initialize Paystack transaction
    const paystackResponse = await this.paystackService.initializeTransaction(
      user.email,
      amount,
      {
        userId,
        transactionId: transaction.id,
        custom_fields: [
          {
            display_name: 'User ID',
            variable_name: 'user_id',
            value: userId,
          },
        ],
      },
    );

    // Update transaction with Paystack reference
    transaction.reference = paystackResponse.reference;
    await this.transactionRepository.save(transaction);

    return {
      reference: paystackResponse.reference,
      authorization_url: paystackResponse.authorization_url,
    };
  }

  async verifyDepositStatus(
    reference: string,
    userId: string,
  ): Promise<any> {
    const transaction = await this.transactionRepository.findOne({
      where: { reference, userId },
      relations: ['wallet'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const paystackVerification = await this.paystackService.verifyTransaction(
      reference,
    );

    return {
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
      verified_status: paystackVerification.status ? 'success' : 'failed',
      created_at: transaction.createdAt,
      paystack_data: paystackVerification,
    };
  }

  async processDepositCallback(reference: string): Promise<void> {
    // This method processes the deposit after payment callback
    // It verifies with Paystack and credits the wallet
    await this.completeDeposit(reference);
  }

  private async completeDeposit(reference: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { reference },
        relations: ['wallet'],
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // Prevent double credit
      if (transaction.status === TransactionStatus.SUCCESS) {
        await queryRunner.commitTransaction();
        return;
      }

      // Update transaction status
      transaction.status = TransactionStatus.SUCCESS;
      await queryRunner.manager.save(transaction);

      // Credit wallet
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: transaction.userId },
      });

      if (wallet) {
        wallet.balance = Number(wallet.balance) + Number(transaction.amount);
        await queryRunner.manager.save(wallet);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Deposit completed for reference: ${reference}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to complete deposit: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async handleWebhookEvent(payload: any): Promise<void> {
    const event = payload.event;
    const data = payload.data;

    this.logger.log(`Webhook Received - Event: ${event}, Reference: ${data?.reference || 'N/A'}`);
    this.logger.log(`Webhook Payload: ${JSON.stringify(payload, null, 2)}`);

    if (event === 'charge.success') {
      const reference = data.reference;
      const amount = data.amount; // Amount in kobo
      const email = data.customer?.email;
      
      this.logger.log(`Processing successful charge - Ref: ${reference}, Amount: ${amount} kobo (${amount/100} NGN), Email: ${email}`);
      
      try {
        // Verify with Paystack first
        const verification = await this.paystackService.verifyTransaction(reference);
        
        if (!verification.status) {
          this.logger.error(` Paystack verification failed for reference: ${reference}`);
          return;
        }

        this.logger.log(`Paystack verification successful for ${reference}`);
        await this.completeDeposit(reference);
        this.logger.log(`Deposit completed successfully - Reference: ${reference}`);
      } catch (error) {
        this.logger.error(`Webhook processing error for ${reference}: ${error.message}`, error.stack);
        throw error;
      }
    } else {
      this.logger.log(`Unhandled webhook event: ${event}`);
    }
  }

  async transferFunds(
    senderId: string,
    recipientWalletNumber: string,
    amount: number,
  ): Promise<{ status: string; message: string; transactionId: string }> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (amount > 10000000) { // Maximum 100,000 NGN per transfer
      throw new BadRequestException('Maximum transfer amount is 100,000 NGN');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get sender's wallet
      const senderWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: senderId },
        relations: ['user'],
      });

      if (!senderWallet) {
        throw new NotFoundException('Sender wallet not found');
      }

      if (Number(senderWallet.balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Check daily transfer limit (1,000,000 NGN)
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      const todayTransfers = await queryRunner.manager.find(Transaction, {
        where: {
          userId: senderId,
          type: TransactionType.TRANSFER,
          status: TransactionStatus.SUCCESS,
          createdAt: Between(startOfToday, endOfToday),
        },
      });

      const totalToday = todayTransfers.reduce((sum, t) => sum + Number(t.amount), 0);
      if (totalToday + amount > 1000000) {
        throw new BadRequestException('Daily transfer limit exceeded (1,000,000 NGN)');
      }

      // Get recipient's wallet
      const recipientWallet = await queryRunner.manager.findOne(Wallet, {
        where: { walletNumber: recipientWalletNumber },
        relations: ['user'],
      });

      if (!recipientWallet) {
        throw new NotFoundException('Recipient wallet not found');
      }

      if (senderWallet.walletNumber === recipientWalletNumber) {
        throw new BadRequestException('Cannot transfer to yourself');
      }

      // Deduct from sender
      senderWallet.balance = Number(senderWallet.balance) - amount;

      // Add to recipient
      recipientWallet.balance = Number(recipientWallet.balance) + amount;

      // Create transaction records
      const senderTransaction = queryRunner.manager.create(Transaction, {
        userId: senderId,
        walletId: senderWallet.id,
        type: TransactionType.TRANSFER,
        amount,
        status: TransactionStatus.SUCCESS,
        reference: `TRF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        recipientWalletNumber,
        senderWalletNumber: senderWallet.walletNumber,
        metadata: {
          recipientEmail: recipientWallet.user.email,
          recipientName: `${recipientWallet.user.firstName} ${recipientWallet.user.lastName}`,
          timestamp: new Date().toISOString(),
        },
      });

      const recipientTransaction = queryRunner.manager.create(Transaction, {
        userId: recipientWallet.userId,
        walletId: recipientWallet.id,
        type: TransactionType.TRANSFER,
        amount,
        status: TransactionStatus.SUCCESS,
        reference: `TRF_IN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderWalletNumber: senderWallet.walletNumber,
        recipientWalletNumber,
        metadata: {
          senderEmail: senderWallet.user.email,
          senderName: `${senderWallet.user.firstName} ${senderWallet.user.lastName}`,
          timestamp: new Date().toISOString(),
        },
      });

      await queryRunner.manager.save(senderWallet);
      await queryRunner.manager.save(recipientWallet);
      await queryRunner.manager.save(senderTransaction);
      await queryRunner.manager.save(recipientTransaction);

      await queryRunner.commitTransaction();

      this.logger.log(`Transfer completed from ${senderWallet.walletNumber} to ${recipientWalletNumber}`);

      return {
        status: 'success',
        message: 'Transfer completed successfully',
        transactionId: senderTransaction.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Transfer failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactionHistory(
    userId: string,
    query: {
      limit: number;
      page: number;
      type?: TransactionType;
      status?: TransactionStatus;
    },
  ): Promise<{ transactions: any[]; total: number; page: number; limit: number }> {
    const { limit, page, type, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['wallet'],
    });

    return {
      transactions: transactions.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        reference: transaction.reference,
        recipient_wallet_number: transaction.recipientWalletNumber,
        sender_wallet_number: transaction.senderWalletNumber,
        metadata: transaction.metadata,
        created_at: transaction.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async getWalletDetails(userId: string): Promise<any> {
    const wallet = await this.getWallet(userId);
    const thirtyDaysAgo = subDays(new Date(), 30);

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: {
        userId,
        createdAt: Between(thirtyDaysAgo, new Date()),
      },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      wallet: {
        wallet_number: wallet.walletNumber,
        balance: Number(wallet.balance),
        currency: wallet.currency,
        created_at: wallet.createdAt,
      },
      recent_transactions: transactions,
      total_transactions_last_30_days: total,
    };
  }
}