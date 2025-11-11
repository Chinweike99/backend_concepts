import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger("Bootstrap");
  const configService = app.get(ConfigService);
  const port = process.env.PORT || configService.get<number>('PORT') || 4000;


  app.useGlobalPipes(new ValidationPipe());

  app.enableCors();

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  console.log( `Application Running on port ${port}`)
}
bootstrap();
