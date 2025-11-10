import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/notification.dto';
// import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponse } from '../shared/types';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async create(
    @Body() createNotificationDto: CreateNotificationDto
  ): Promise<NotificationResponse> {
    return this.notificationService.sendNotification(createNotificationDto);
  }
}