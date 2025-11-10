import { Injectable, Inject } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
// import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationRequest, NotificationResponse } from '../shared/types';
import { v4 as uuidv4 } from 'uuid';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(private rabbitMQService: RabbitMQService) {}

  async sendNotification(createNotificationDto: CreateNotificationDto): Promise<NotificationResponse> {
    try {
      const notificationId = uuidv4();
      
      const notificationRequest: NotificationRequest = {
        notification_id: notificationId,
        user_id: createNotificationDto.user_id,
        type: createNotificationDto.type,
        template_id: createNotificationDto.template_id,
        variables: createNotificationDto.variables,
        priority: createNotificationDto?.priority!,
      };

      // Publish to appropriate queue based on type
      const routingKey = createNotificationDto.type;
      const published = await this.rabbitMQService.publishToQueue(routingKey, notificationRequest);

      if (!published) {
        throw new Error('Failed to publish message to queue');
      }

      return {
        success: true,
        message: 'Notification queued successfully',
        data: {
          notification_id: notificationId,
          status: 'pending'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to queue notification'
      };
    }
  }
}