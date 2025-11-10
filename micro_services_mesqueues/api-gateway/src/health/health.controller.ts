import { Controller, Get } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Controller('health')
export class HealthController {
  constructor(private rabbitMQService: RabbitMQService) {}

  @Get()
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        api_gateway: 'healthy',
        // Add more service checks as needed
      }
    };
  }
}