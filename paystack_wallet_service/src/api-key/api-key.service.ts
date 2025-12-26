import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey, Permission } from '../entities/api-key.entity';
import { User } from '../entities/user.entity';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { CreateApiKeyDto } from './dto/api-key.dto';
import { RolloverApiKeyDto } from './dto/rollover-key.dto';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private calculateExpiry(expiryCode: string): Date {
    const now = new Date();
    switch (expiryCode) {
      case '1H':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case '1D':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case '1M':
        return new Date(now.setMonth(now.getMonth() + 1));
      case '1Y':
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        throw new BadRequestException('Invalid expiry code. Use: 1H, 1D, 1M, 1Y');
    }
  }

  async createApiKey(userId: string, createApiKeyDto: CreateApiKeyDto) {
    // Check active keys count
    const activeKeys = await this.apiKeyRepository.find({
      where: {
        userId,
        isActive: true,
      },
    });

    const validActiveKeys = activeKeys.filter(key => !key.isExpired());
    
    if (validActiveKeys.length >= 5) {
      throw new BadRequestException('Maximum of 5 active API keys allowed per user');
    }

    const expiresAt = this.calculateExpiry(createApiKeyDto.expiry);

    // Generate raw API key
    const rawKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`;
    
    // Create API key entity (it will hash the key in @BeforeInsert)
    const apiKey = this.apiKeyRepository.create({
      name: createApiKeyDto.name,
      permissions: createApiKeyDto.permissions as Permission[],
      expiresAt,
      userId,
    });

    // Temporarily store raw key
    (apiKey as any)._rawKey = rawKey;

    const savedKey = await this.apiKeyRepository.save(apiKey);

    // Get the raw key before clearing
    const returnedKey = savedKey.getRawKey();
    savedKey.clearRawKey();

    return {
      api_key: returnedKey,
      expires_at: savedKey.expiresAt,
      id: savedKey.id,
      name: savedKey.name,
      permissions: savedKey.permissions,
      created_at: savedKey.createdAt,
    };
  }

  async rolloverApiKey(userId: string, rolloverDto: RolloverApiKeyDto) {
    // Find expired key
    const expiredKey = await this.apiKeyRepository.findOne({
      where: {
        id: rolloverDto.expiredKeyId,
        userId,
      },
    });

    if (!expiredKey) {
      throw new NotFoundException('API key not found');
    }

    if (!expiredKey.isExpired()) {
      throw new BadRequestException('API key is not expired');
    }

    // Check active keys count
    const activeKeys = await this.apiKeyRepository.find({
      where: {
        userId,
        isActive: true,
      },
    });

    const validActiveKeys = activeKeys.filter(key => !key.isExpired());
    
    if (validActiveKeys.length >= 5) {
      throw new BadRequestException('Maximum of 5 active API keys allowed per user');
    }

    // Create new key with same permissions
    const expiresAt = this.calculateExpiry(rolloverDto.expiry);
    const rawKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`;

    const newApiKey = this.apiKeyRepository.create({
      name: expiredKey.name,
      permissions: expiredKey.permissions,
      expiresAt,
      userId,
    });

    // Temporarily store raw key
    (newApiKey as any)._rawKey = rawKey;

    const savedKey = await this.apiKeyRepository.save(newApiKey);

    // Deactivate old key
    expiredKey.isActive = false;
    await this.apiKeyRepository.save(expiredKey);

    // Get the raw key before clearing
    const returnedKey = savedKey.getRawKey();
    savedKey.clearRawKey();

    return {
      api_key: returnedKey,
      expires_at: savedKey.expiresAt,
      id: savedKey.id,
      name: savedKey.name,
      permissions: savedKey.permissions,
      created_at: savedKey.createdAt,
    };
  }

  async getUserApiKeys(userId: string) {
    const apiKeys = await this.apiKeyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      permissions: key.permissions,
      is_active: key.isActive,
      expires_at: key.expiresAt,
      last_used_at: key.lastUsedAt,
      created_at: key.createdAt,
      is_expired: key.isExpired(),
    }));
  }

  async revokeApiKey(userId: string, apiKeyId: string) {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: apiKeyId, userId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    apiKey.isActive = false;
    await this.apiKeyRepository.save(apiKey);

    return { 
      message: 'API key revoked successfully',
      id: apiKey.id,
      name: apiKey.name,
    };
  }

  async validateApiKey(apiKeyString: string): Promise<ApiKey> {
    const apiKeys = await this.apiKeyRepository.find({
      where: { isActive: true },
      relations: ['user'],
    });

    // Find the matching key by verifying the hash
    for (const apiKey of apiKeys) {
      try {
        const isValid = await apiKey.validateKey(apiKeyString);
        if (isValid) {
          if (!apiKey.canBeUsed()) {
            throw new ForbiddenException('API key is expired');
          }
          return apiKey;
        }
      } catch (error) {
        // Continue checking other keys
      }
    }

    throw new ForbiddenException('Invalid API key');
  }

  async updateLastUsed(apiKeyId: string): Promise<void> {
    await this.apiKeyRepository.update(apiKeyId, {
      lastUsedAt: new Date(),
    });
  }
}