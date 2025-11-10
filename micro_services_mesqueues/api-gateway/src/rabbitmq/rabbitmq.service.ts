import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  private async connect() {
    try {
      const url = this.configService.get<string>('RABBITMQ_URL');
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      // Assert exchanges and queues
      await this.setupExchangesAndQueues();
      
      console.log('Connected to RabbitMQ ..');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  private async setupExchangesAndQueues() {
    // Assert direct exchange
    await this.channel.assertExchange('notifications.direct', 'direct', { durable: true });
    
    // Assert queues
    await this.channel.assertQueue('email.queue', { durable: true });
    await this.channel.assertQueue('push.queue', { durable: true });
    await this.channel.assertQueue('failed.queue', { durable: true });
    
    // Bind queues to exchange
    await this.channel.bindQueue('email.queue', 'notifications.direct', 'email');
    await this.channel.bindQueue('push.queue', 'notifications.direct', 'push');
    await this.channel.bindQueue('failed.queue', 'notifications.direct', 'failed');
  }

  async publishToQueue(routingKey: string, message: unknown): Promise<boolean> {
    try {
      return this.channel.publish(
        'notifications.direct',
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
    } catch (error) {
      console.error('Failed to publish message:', error);
      throw error;
    }
  }
}