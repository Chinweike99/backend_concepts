import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource} from 'typeorm';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { FundWalletDto } from '../dto/fund-wallet.dto';
import { TransferDto } from '../dto/transfer.dto';
import { Transaction, TransactionType, TransactionStatus } from 'src/entities/transaction.entity';
import { Wallet } from 'src/entities/wallet.entity';

@Injectable()
export class WalletsService {
  private readonly idempotencyCache = new Map<string, any>();

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  private generateTransactionReference(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  // Create a new wallet
  async createWallet(dto: CreateWalletDto): Promise<Wallet> {

    const notExistingCurrency = dto.currency && !['USD', 'EUR', 'NGN'].includes(dto.currency);
    if (notExistingCurrency) {
      throw new BadRequestException(`Currency ${dto.currency} is not supported`);
    }
    
    const wallet = this.walletRepository.create({
      currency: dto.currency || 'USD',
      balance: 0,
    });
    return this.walletRepository.save(wallet);
  }

  // Fund a wallet
  async fundWallet(dto: FundWalletDto): Promise<{ wallet: Wallet; reference: string; idempotencyKey?: string }> {
    if (dto.idempotencyKey && this.idempotencyCache.has(dto.idempotencyKey)) {
      return this.idempotencyCache.get(dto.idempotencyKey);
    }
    if (dto.idempotencyKey) {
      const existingTransaction = await this.transactionRepository.findOne({
        where: { 
          wallet: { id: dto.walletId },
          type: TransactionType.DEPOSIT,
        },
        relations: ['wallet'],
        order: { createdAt: 'DESC' },
      });
      
      if (existingTransaction?.metadata?.idempotencyKey === dto.idempotencyKey) {
        const cachedResult = {
          wallet: existingTransaction.wallet,
          reference: existingTransaction.reference,
          idempotencyKey: dto.idempotencyKey,
        };
        this.idempotencyCache.set(dto.idempotencyKey, cachedResult);
        return cachedResult;
      }
    }

    const wallet = await this.walletRepository.findOne({ where: { id: dto.walletId } });
    if (!wallet) throw new NotFoundException(`Wallet with ID ${dto.walletId} not found`);
    if (dto.amount <= 0) throw new BadRequestException('Amount must be positive');

    wallet.balance = Number(wallet.balance) + Number(dto.amount);

    await this.walletRepository.save(wallet);

    const transaction = this.transactionRepository.create({
      wallet: wallet,
      type: TransactionType.DEPOSIT,
      amount: dto.amount,
      status: TransactionStatus.COMPLETED,
      reference: this.generateTransactionReference(),
      metadata: dto.idempotencyKey ? { idempotencyKey: dto.idempotencyKey } : undefined,
      description: dto.description || 'Wallet funding',
    });
    await this.transactionRepository.save(transaction);

    const result = {
      wallet,
      reference: transaction.reference,
      idempotencyKey: dto.idempotencyKey,
    };

    // Cache the result
    if (dto.idempotencyKey) {
      this.idempotencyCache.set(dto.idempotencyKey, result);
    }

    return result;
  }

  // Transfer funds between wallets
  async transferFunds(dto: TransferDto): Promise<{ sender: Wallet; receiver: Wallet; reference: string; idempotencyKey?: string }> {
    if (dto.idempotencyKey && this.idempotencyCache.has(dto.idempotencyKey)) {
      return this.idempotencyCache.get(dto.idempotencyKey);
    }

    if (dto.idempotencyKey) {
      const existingTransaction = await this.transactionRepository.findOne({
        where: {
          senderWalletId: dto.senderWalletId,
          receiverWalletId: dto.receiverWalletId,
          type: TransactionType.TRANSFER_OUT,
        },
        order: { createdAt: 'DESC' },
      });
      
      if (existingTransaction?.metadata?.idempotencyKey === dto.idempotencyKey) {
        const sender = await this.walletRepository.findOne({ where: { id: dto.senderWalletId } });
        const receiver = await this.walletRepository.findOne({ where: { id: dto.receiverWalletId } });
        const cachedResult = {
          sender,
          receiver,
          reference: existingTransaction.reference,
          idempotencyKey: dto.idempotencyKey,
        } as WalletsService['transferFunds'] extends Promise<infer R> ? R : never;
        this.idempotencyCache.set(dto.idempotencyKey, cachedResult);
        return cachedResult;
      }
    }

    if (dto.senderWalletId === dto.receiverWalletId) {
      throw new BadRequestException('Cannot transfer to the same wallet');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sender = await queryRunner.manager.findOne(Wallet, { where: { id: dto.senderWalletId } });
      const receiver = await queryRunner.manager.findOne(Wallet, { where: { id: dto.receiverWalletId } });

      if (!sender) throw new NotFoundException(`senderWalletId not found`);
      if (!receiver) throw new NotFoundException(`receiverWalletId not found`);
      if (sender.currency !== receiver.currency) {
        throw new BadRequestException('Currency mismatch between wallets');
      }

      const amount = Number(dto.amount);
      if (amount <= 0) throw new BadRequestException('Amount must be positive');
      if (Number(sender.balance) < amount) throw new BadRequestException('Insufficient balance');

      sender.balance = Number(sender.balance) - amount;
      receiver.balance = Number(receiver.balance) + amount;

      await queryRunner.manager.save([sender, receiver]);

      // Generate unique reference for this transfer
      const transferReference = this.generateTransactionReference();

      const senderTx = this.transactionRepository.create({
        wallet: sender,
        type: TransactionType.TRANSFER_OUT,
        amount,
        status: TransactionStatus.COMPLETED,
        reference: transferReference,
        metadata: dto.idempotencyKey ? { idempotencyKey: dto.idempotencyKey } : undefined,
        senderWalletId: sender.id,
        receiverWalletId: receiver.id,
        description: dto.description || `Transfer to ${receiver.id}`,
      });
      const receiverTx = this.transactionRepository.create({
        wallet: receiver,
        type: TransactionType.TRANSFER_IN,
        amount,
        status: TransactionStatus.COMPLETED,
        reference: transferReference,
        metadata: dto.idempotencyKey ? { idempotencyKey: dto.idempotencyKey } : undefined,
        senderWalletId: sender.id,
        receiverWalletId: receiver.id,
        description: dto.description || `Transfer from ${sender.id}`,
      });

      await queryRunner.manager.save([senderTx, receiverTx]);
      await queryRunner.commitTransaction();

      const result = {
        sender,
        receiver,
        reference: transferReference,
        idempotencyKey: dto.idempotencyKey,
      };

      if (dto.idempotencyKey) {
        this.idempotencyCache.set(dto.idempotencyKey, result);
      }

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Get wallet details with transactions
  async getWalletDetails(walletId: string): Promise<{ wallet: Wallet; transactions: any[] }> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    if (!wallet) throw new NotFoundException(`Wallet not found`);

    const transactions = await this.transactionRepository.find({
      where: { wallet: { id: walletId } },
      order: { createdAt: 'DESC' },
    });

    const cleanedTransactions = transactions.map(tx => {
      const { senderWalletId, receiverWalletId, reference, metadata, ...rest } = tx;
      
      const result: any = { ...rest };
      
      if (tx.type === TransactionType.TRANSFER_OUT && receiverWalletId) {
        result.receiverWalletId = receiverWalletId;
      } else if (tx.type === TransactionType.TRANSFER_IN && senderWalletId) {
        result.senderWalletId = senderWalletId;
      }
      
      if (reference) result.reference = reference;
      if (metadata) result.metadata = metadata;
      
      return result;
    });

    return { wallet, transactions: cleanedTransactions };
  }
}
