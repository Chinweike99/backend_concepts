import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './notification/notification.module';
import { HealthModule } from './health/health.module';
// import { NotificationModule } from './notification/notification.module';
// import { AuthModule } from './auth/auth.module';
// import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    NotificationModule,
    // AuthModule,
    HealthModule,
  ],
})
export class AppModule {}