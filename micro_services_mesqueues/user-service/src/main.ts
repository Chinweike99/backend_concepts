import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.enableCors()

  await app.listen(process.env.PORT ?? 3003);

  console.log(`User Service is running on port ${process.env.PORT ?? 3003}`);
}
bootstrap();
