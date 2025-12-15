import { Module } from '@nestjs/common';
import { StringAnalysisController } from './string-analysis/controllers/string-analysis.controller';
import { StringAnalysisService } from './string-analysis/services/string-analysis.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController, StringAnalysisController],
  providers: [ AppService, StringAnalysisService],
})
export class AppModule {}