import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.contoller';
import { GoogleStrategy } from './strategy/google.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtAuthGuard } from './strategy/jwt-auth.guard';
import { CompositeAuthGuard } from './strategy/composite-auth.guard';
import { ApiKeyModule } from '../api-key/api-key.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => ApiKeyModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy, JwtAuthGuard, CompositeAuthGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, CompositeAuthGuard],
})
export class AuthModule {}