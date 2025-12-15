import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import * as fs from 'fs';
import * as path from 'path';

import { CountriesModule } from './countries/countries.module';
import { StatusController } from './status/status.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
        

    //     type: 'mysql',
    //     host: configService.get('DB_HOST', 'localhost'),
    //     port: parseInt(configService.get('DB_PORT', '3306')),
    //     username: configService.get('DB_USERNAME', 'root'),
    //     password: configService.get('DB_PASSWORD', ''),
    //     database: configService.get('DB_NAME', 'country_api'),
    //     entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //     synchronize: configService.get('DB_SYNC', true),
    //   }),
    //   inject: [ConfigService],
    // }),


  TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    // Add this logging
    console.log('DB_HOST:', configService.get('DB_HOST'));
    console.log('DB_PORT:', configService.get('DB_PORT'));
    console.log('DB_USERNAME:', configService.get('DB_USERNAME'));
    console.log('DB_NAME:', configService.get('DB_NAME'));
    console.log('All env vars:', process.env.DB_HOST, process.env.DB_PORT);
    
    return {
      type: 'mysql',
      host: configService.get('DB_HOST', 'localhost'),
      port: parseInt(configService.get('DB_PORT', '3306')),
      username: configService.get('DB_USERNAME', 'root'),
      password: configService.get('DB_PASSWORD', ''),
      database: configService.get('DB_NAME', 'defaultdb'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: configService.get('DB_SYNC', true),
      // ssl: {
      //       ca: fs.readFileSync(path.join(__dirname, '../ca-certificate.pem')).toString(),
      //       rejectUnauthorized: true,
      //     }
    };
  },
  inject: [ConfigService],
}),

    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 10000,
        maxRedirects: 5,
      }),
    }),
    CountriesModule,
  ],
  controllers: [StatusController],
})
export class AppModule {}