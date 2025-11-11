import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // ✅ REQUIRED for TypeOrmHealthIndicator
    TerminusModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
