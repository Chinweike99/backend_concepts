import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from 'src/entities/wallet.entity';
import { Transaction, TransactionType, TransactionStatus } from 'src/entities/transaction.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

describe('WalletsService', () => {
  let service: WalletsService;
  let mockWalletRepo: any;
  let mockTransactionRepo: any;
  let mockDataSource: any;
  let mockQueryRunner: any;

  beforeEach(async () => {
    // Mock wallet repository
    mockWalletRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    // Mock transaction repository
    mockTransactionRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    // Mock QueryRunner
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
      },
    };

    // Mock DataSource
    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepo,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset the queryRunner mocks
    mockQueryRunner.manager.findOne.mockReset();
    mockQueryRunner.manager.save.mockReset();
  });

  describe('createWallet', () => {
    it('should create a wallet with default USD currency', async () => {
      const dto = {};
      const mockWallet = {
        id: '123',
        currency: 'USD',
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWalletRepo.create.mockReturnValue(mockWallet);
      mockWalletRepo.save.mockResolvedValue(mockWallet);

      const result = await service.createWallet(dto);

      expect(mockWalletRepo.create).toHaveBeenCalledWith({
        currency: 'USD',
        balance: 0,
      });
      expect(result.balance).toBe(0);
      expect(result.currency).toBe('USD');
    });

    it('should create a wallet with specified currency', async () => {
      const dto = { currency: 'NGN' };
      const mockWallet = {
        id: '456',
        currency: 'NGN',
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWalletRepo.create.mockReturnValue(mockWallet);
      mockWalletRepo.save.mockResolvedValue(mockWallet);

      const result = await service.createWallet(dto);

      expect(result.currency).toBe('NGN');
      expect(result.balance).toBe(0);
    });

    it('should throw error for unsupported currency', async () => {
      const dto = { currency: 'GBP' };

      await expect(service.createWallet(dto)).rejects.toThrow(BadRequestException);
      await expect(service.createWallet(dto)).rejects.toThrow('Currency GBP is not supported');
    });
  });

  describe('fundWallet', () => {
    it('should successfully fund a wallet', async () => {
      const dto = { walletId: '123', amount: 100 };
      const mockWallet = {
        id: '123',
        balance: 50,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockTransaction = {
        id: 'tx-1',
        reference: 'TXN-123-ABC',
        wallet: mockWallet,
        type: TransactionType.DEPOSIT,
        amount: 100,
        status: TransactionStatus.COMPLETED,
      };

      mockWalletRepo.findOne.mockResolvedValue(mockWallet);
      mockWalletRepo.save.mockResolvedValue({ ...mockWallet, balance: 150 });
      mockTransactionRepo.create.mockReturnValue(mockTransaction);
      mockTransactionRepo.save.mockResolvedValue(mockTransaction);
      mockTransactionRepo.findOne.mockResolvedValue(null);

      const result = await service.fundWallet(dto);

      expect(result.wallet.balance).toBe(150);
      expect(result.reference).toBeDefined();
      expect(mockWalletRepo.save).toHaveBeenCalled();
      expect(mockTransactionRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when wallet does not exist', async () => {
      const dto = { walletId: 'non-existent', amount: 100 };

      mockWalletRepo.findOne.mockResolvedValue(null);

      await expect(service.fundWallet(dto)).rejects.toThrow(NotFoundException);
      await expect(service.fundWallet(dto)).rejects.toThrow('Wallet with ID non-existent not found');
    });

    it('should throw BadRequestException for negative amount', async () => {
      const dto = { walletId: '123', amount: -50 };
      const mockWallet = { id: '123', balance: 100 };

      mockWalletRepo.findOne.mockResolvedValue(mockWallet);

      await expect(service.fundWallet(dto)).rejects.toThrow(BadRequestException);
      await expect(service.fundWallet(dto)).rejects.toThrow('Amount must be positive');
    });

    it('should throw BadRequestException for zero amount', async () => {
      const dto = { walletId: '123', amount: 0 };
      const mockWallet = { id: '123', balance: 100 };

      mockWalletRepo.findOne.mockResolvedValue(mockWallet);

      await expect(service.fundWallet(dto)).rejects.toThrow(BadRequestException);
      await expect(service.fundWallet(dto)).rejects.toThrow('Amount must be positive');
    });

    it('should handle idempotency - return cached result for duplicate request', async () => {
      const dto = {
        walletId: '123',
        amount: 100,
        idempotencyKey: 'test-key-001',
      };
      const mockWallet = {
        id: '123',
        balance: 50,
        currency: 'USD',
      };

      mockWalletRepo.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepo.findOne.mockResolvedValue(null);
      mockWalletRepo.save.mockResolvedValue({ ...mockWallet, balance: 150 });
      mockTransactionRepo.create.mockReturnValue({
        reference: 'TXN-123-ABC',
        wallet: mockWallet,
      });
      mockTransactionRepo.save.mockResolvedValue({});

      // First call
      const result1 = await service.fundWallet(dto);

      // Second call with same idempotency key
      const result2 = await service.fundWallet(dto);

      // Should return cached result
      expect(result1).toEqual(result2);
      // Save should only be called once
      expect(mockWalletRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('transferFunds', () => {
    it('should successfully transfer funds between wallets', async () => {
      const dto = {
        senderWalletId: 'sender-123',
        receiverWalletId: 'receiver-456',
        amount: 100,
      };

      const mockSender = {
        id: 'sender-123',
        balance: 500,
        currency: 'USD',
      };

      const mockReceiver = {
        id: 'receiver-456',
        balance: 200,
        currency: 'USD',
      };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockSender)
        .mockResolvedValueOnce(mockReceiver);
      mockQueryRunner.manager.save.mockResolvedValue([
        { ...mockSender, balance: 400 },
        { ...mockReceiver, balance: 300 },
      ]);

      mockTransactionRepo.create.mockReturnValue({});
      mockTransactionRepo.findOne.mockResolvedValue(null);

      const result = await service.transferFunds(dto);

      expect(result.sender.balance).toBe(400);
      expect(result.receiver.balance).toBe(300);
      expect(result.reference).toBeDefined();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw BadRequestException when sender and receiver are the same', async () => {
      const dto = {
        senderWalletId: 'wallet-123',
        receiverWalletId: 'wallet-123',
        amount: 100,
      };

      mockTransactionRepo.findOne.mockResolvedValue(null);

      await expect(service.transferFunds(dto)).rejects.toThrow(BadRequestException);
      await expect(service.transferFunds(dto)).rejects.toThrow('Cannot transfer to the same wallet');
    });

    it('should throw NotFoundException when sender wallet does not exist', async () => {
      const dto = {
        senderWalletId: 'non-existent',
        receiverWalletId: 'receiver-456',
        amount: 100,
      };

      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);
      mockTransactionRepo.findOne.mockResolvedValue(null);

      await expect(service.transferFunds(dto)).rejects.toThrow(NotFoundException);
      await expect(service.transferFunds(dto)).rejects.toThrow('senderWalletId not found');
    });

    it('should throw NotFoundException when receiver wallet does not exist', async () => {
      const dto = {
        senderWalletId: 'sender-123',
        receiverWalletId: 'non-existent',
        amount: 100,
      };

      const mockSender = {
        id: 'sender-123',
        balance: 500,
        currency: 'USD',
      };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockSender)
        .mockResolvedValueOnce(null);
      mockTransactionRepo.findOne.mockResolvedValue(null);

      await expect(service.transferFunds(dto)).rejects.toThrow(NotFoundException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for insufficient balance', async () => {
      const dto = {
        senderWalletId: 'sender-123',
        receiverWalletId: 'receiver-456',
        amount: 1000,
      };

      const mockSender = {
        id: 'sender-123',
        balance: 500,
        currency: 'USD',
      };

      const mockReceiver = {
        id: 'receiver-456',
        balance: 200,
        currency: 'USD',
      };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockSender)
        .mockResolvedValueOnce(mockReceiver);
      mockTransactionRepo.findOne.mockResolvedValue(null);

      await expect(service.transferFunds(dto)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for currency mismatch', async () => {
      const dto = {
        senderWalletId: 'sender-123',
        receiverWalletId: 'receiver-456',
        amount: 100,
      };

      const mockSender = {
        id: 'sender-123',
        balance: 500,
        currency: 'USD',
      };

      const mockReceiver = {
        id: 'receiver-456',
        balance: 200,
        currency: 'NGN',
      };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockSender)
        .mockResolvedValueOnce(mockReceiver);
      mockTransactionRepo.findOne.mockResolvedValue(null);

      await expect(service.transferFunds(dto)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should handle idempotency for transfer - return cached result', async () => {
      const dto = {
        senderWalletId: 'sender-123',
        receiverWalletId: 'receiver-456',
        amount: 100,
        idempotencyKey: 'transfer-key-001',
      };

      const mockSender = {
        id: 'sender-123',
        balance: 500,
        currency: 'USD',
      };

      const mockReceiver = {
        id: 'receiver-456',
        balance: 200,
        currency: 'USD',
      };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockSender)
        .mockResolvedValueOnce(mockReceiver);
      mockQueryRunner.manager.save.mockResolvedValue([
        { ...mockSender, balance: 400 },
        { ...mockReceiver, balance: 300 },
      ]);

      mockTransactionRepo.create.mockReturnValue({});
      mockTransactionRepo.findOne.mockResolvedValue(null);

      // First call
      const result1 = await service.transferFunds(dto);

      // Second call with same idempotency key
      const result2 = await service.transferFunds(dto);

      // Should return cached result
      expect(result1).toEqual(result2);
      // Transaction should only be committed once
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    });

    it('should rollback transaction on error', async () => {
      const dto = {
        senderWalletId: 'sender-123',
        receiverWalletId: 'receiver-456',
        amount: 100,
      };

      mockQueryRunner.manager.findOne.mockRejectedValue(new Error('Database error'));
      mockTransactionRepo.findOne.mockResolvedValue(null);

      await expect(service.transferFunds(dto)).rejects.toThrow('Database error');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('getWalletDetails', () => {
    it('should return wallet with transactions', async () => {
      const walletId = '123';
      const mockWallet = {
        id: '123',
        balance: 500,
        currency: 'USD',
      };

      const mockTransactions = [
        {
          id: 'tx-1',
          walletId: '123',
          type: TransactionType.DEPOSIT,
          amount: 500,
          status: TransactionStatus.COMPLETED,
          reference: 'TXN-1',
          description: 'Deposit',
          createdAt: new Date(),
          metadata: null,
          senderWalletId: null,
          receiverWalletId: null,
        },
      ];

      mockWalletRepo.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepo.find.mockResolvedValue(mockTransactions);

      const result = await service.getWalletDetails(walletId);

      expect(result.wallet).toEqual(mockWallet);
      expect(result.transactions).toHaveLength(1);
      expect(mockTransactionRepo.find).toHaveBeenCalledWith({
        where: { wallet: { id: walletId } },
        order: { createdAt: 'DESC' },
      });
    });

    it('should throw NotFoundException when wallet does not exist', async () => {
      const walletId = 'non-existent';

      mockWalletRepo.findOne.mockResolvedValue(null);

      await expect(service.getWalletDetails(walletId)).rejects.toThrow(NotFoundException);
      await expect(service.getWalletDetails(walletId)).rejects.toThrow('Wallet not found');
    });

    it('should filter out null reference and metadata from transactions', async () => {
      const walletId = '123';
      const mockWallet = {
        id: '123',
        balance: 500,
        currency: 'USD',
      };

      const mockTransactions = [
        {
          id: 'tx-1',
          walletId: '123',
          type: TransactionType.TRANSFER_OUT,
          amount: 100,
          status: TransactionStatus.COMPLETED,
          reference: 'TXN-1',
          description: 'Transfer',
          createdAt: new Date(),
          metadata: null,
          senderWalletId: '123',
          receiverWalletId: '456',
        },
      ];

      mockWalletRepo.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepo.find.mockResolvedValue(mockTransactions);

      const result = await service.getWalletDetails(walletId);

      // Check that null metadata is not in the response
      expect(result.transactions[0]).not.toHaveProperty('metadata');
      // Check that receiverWalletId is included for TRANSFER_OUT
      expect(result.transactions[0]).toHaveProperty('receiverWalletId', '456');
      // Check that senderWalletId is NOT included for TRANSFER_OUT
      expect(result.transactions[0]).not.toHaveProperty('senderWalletId');
    });
  });
});
