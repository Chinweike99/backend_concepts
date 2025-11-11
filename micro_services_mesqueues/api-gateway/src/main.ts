import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
// import { AppModule } from './app.module.js';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  app.enableCors();
  
  await app.listen(3002);
  console.log('API Gateway running on port 3002');
}
bootstrap();