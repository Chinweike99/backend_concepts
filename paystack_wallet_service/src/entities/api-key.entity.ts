import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

export enum Permission {
  READ = 'read',
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
}

@Entity('api_keys')
@Index(['key'])
@Index(['userId', 'isActive'])
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  key: string; // Hashed API key

  @Column({ type: 'jsonb', default: [] })
  permissions: Permission[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'expires_at' })
  @Index()
  expiresAt: Date;

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.apiKeys)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @BeforeInsert()
  async generateKey() {
    // Generate raw API key
    const rawKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`;
    // Store only the hash
    this.key = await argon2.hash(rawKey);
    // Store raw key temporarily for returning to user (will be cleared)
    (this as any)._rawKey = rawKey;
  }

  @BeforeUpdate()
  async hashKeyIfNeeded() {
    // If key was updated and not already hashed
    if (this.key && !this.key.startsWith('$argon2')) {
      this.key = await argon2.hash(this.key);
    }
  }

  async validateKey(inputKey: string): Promise<boolean> {
    try {
      return await argon2.verify(this.key, inputKey);
    } catch {
      return false;
    }
  }

  hasPermission(permission: Permission): boolean {
    return this.permissions.includes(permission);
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  canBeUsed(): boolean {
    return this.isActive && !this.isExpired();
  }

  getRawKey(): string {
    return (this as any)._rawKey || '';
  }

  clearRawKey(): void {
    delete (this as any)._rawKey;
  }
}