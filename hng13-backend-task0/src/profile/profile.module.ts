import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env'
        }),

    ],
    controllers: [ProfileController],
    providers: [ProfileService]
})
export class ProfileModule {}