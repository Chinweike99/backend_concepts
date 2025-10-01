import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TestController } from './test/test.controller';
import { Test2Controller } from './test2/test2.controller';

@Module({
  imports: [UsersModule],
  controllers: [AppController, TestController, Test2Controller],
  providers: [AppService],
})
export class AppModule {}
